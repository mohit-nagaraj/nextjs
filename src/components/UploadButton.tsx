"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(e) => {
        if (!e) setIsOpen(e);
      }}
    >
        {/* By default its not controlled we can only control thru this */}
        {/* passing the asChild cuz we want custom button, not the one provided by them*/}
        {/* since we made it control we also need to implement onclick action */}
        <DialogTrigger onClick={()=>setIsOpen(true)} asChild>
            <Button>Upload PDF</Button>
        </DialogTrigger>

        {/* this is the content tht shud go inside dialog box else nothing will be shown */}
        <DialogContent>
            example content
        </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
