import { useContext } from "react";
import { BusinessAuthContext } from "../context/BusinessAuthContext";

export const useBusinessAuth = () => {
  const context = useContext(BusinessAuthContext);

  if (!context) {
    throw new Error("useBusinessAuth must be used within BusinessAuthProvider");
  }

  return context;
};

export default useBusinessAuth;
