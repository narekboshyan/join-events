import React, { PropsWithChildren } from "react";
import Header from "@/components/Header";

const HeaderLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default HeaderLayout;
