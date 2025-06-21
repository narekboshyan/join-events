import Header from "@/components/Header";
import React, { PropsWithChildren } from "react";

const HeaderLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default HeaderLayout;
