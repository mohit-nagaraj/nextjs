import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { ChevronRight } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>QuillBot</span>
          </Link>
          {/* todo:mobile */}
          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                href="/pricing"
                //u can style it like a button even if its like a link
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Sign in
              </LoginLink>
              <RegisterLink
                className={buttonVariants({
                  size: "sm",
                })}
              >
                Get started <ChevronRight  className='ml-1.5 h-5 w-5' />
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
