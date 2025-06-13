"use client";
import AIAssignmentWriter from "@/components/ai-assignment-writer"
// import { useRouter } from "next/na";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
 
  const router = useRouter();


  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/auth/sign-in");
    }
  }, [])
  
  return (
    <main className="min-h-screen">
      <AIAssignmentWriter />
    </main>
  );
}
