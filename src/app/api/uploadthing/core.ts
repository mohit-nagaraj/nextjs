import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "../../../../stripe";


const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new Error("Unauthorized");
  const subscriptionPlan= await getUserSubscriptionPlan()

  return { subscriptionPlan, userId: user.id };

};

//adding file info to our db after its uploaded into storage
const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExist) return;
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://utfs.io/f/${file.key}`,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    const response = await fetch(`https://utfs.io/f/${file.key}`);

    const blob = await response.blob();
    
    const loader = new PDFLoader(blob);
    
    const pageLevelDocs = await loader.load();
    
    const pagesAmt = pageLevelDocs.length;
    if (pageLevelDocs.length === 0) {
      throw new Error("Failed to load PDF pages");
    }
        const { subscriptionPlan } = metadata;
        const { isSubscribed } = subscriptionPlan;

        const isProExceeded =
          pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
        const isFreeExceeded =
          pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

        if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
          await db.file.update({
            data: {
              uploadStatus: "FAILED",
            },
            where: {
              id: createdFile.id,
            },
          });
        }

    // vectorize and index entire document
    const pineconeIndex = pinecone.index("quillbot");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });
    
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (err) {
    console.error(err);
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

export const ourFileRouter = {
  PdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    //midleware is a function that runs before the file is uploaded n tht request to upload is sent
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
    ProPdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    //midleware is a function that runs before the file is uploaded n tht request to upload is sent
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
