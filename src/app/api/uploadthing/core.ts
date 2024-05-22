import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  return { userId: user.id };
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
  //   const isFileExist = await db.file.findFirst({
  //     where: {
  //       key: file.key,
  //     },
  //   });

  //   if (isFileExist) return;
  console.log(file.url);
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: "PROCESSING",
    },
  });

  //   try {
  //     const response = await fetch(
  //       `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
  //     );

  //     const blob = await response.blob();

  //     const loader = new PDFLoader(blob);

  //     const pageLevelDocs = await loader.load();

  //     const pagesAmt = pageLevelDocs.length;

  //     const { subscriptionPlan } = metadata;
  //     const { isSubscribed } = subscriptionPlan;

  //     const isProExceeded =
  //       pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
  //     const isFreeExceeded =
  //       pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

  //     if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
  //       await db.file.update({
  //         data: {
  //           uploadStatus: "FAILED",
  //         },
  //         where: {
  //           id: createdFile.id,
  //         },
  //       });
  //     }

  //     // vectorize and index entire document
  //     const pinecone = await getPineconeClient();
  //     const pineconeIndex = pinecone.Index("quill");

  //     const embeddings = new OpenAIEmbeddings({
  //       openAIApiKey: process.env.OPENAI_API_KEY,
  //     });

  //     await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
  //       pineconeIndex,
  //       namespace: createdFile.id,
  //     });

  //     await db.file.update({
  //       data: {
  //         uploadStatus: "SUCCESS",
  //       },
  //       where: {
  //         id: createdFile.id,
  //       },
  //     });
  //   } catch (err) {
  //     await db.file.update({
  //       data: {
  //         uploadStatus: "FAILED",
  //       },
  //       where: {
  //         id: createdFile.id,
  //       },
  //     });
  //   }
};

export const ourFileRouter = {
  PdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    //midleware is a function that runs before the file is uploaded n tht request to upload is sent
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
