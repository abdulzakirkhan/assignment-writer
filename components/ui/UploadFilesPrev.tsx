"use client"
import {BookOpen, FileText, FileType, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import React from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'
type UploadedFile = {
  id: any;
  name: any;
  size: any;
  type: "PDF" | "DOC" | "DOCS" | "OTHER"; 
  category: "assignment-brief" | "module-material" | "reading-list" | string;
};

type UploadFilesPrevProps = {
  uploadedFiles: UploadedFile[];
  removeFile: (id: any) => void;
  indexNo: string;
};

export default function UploadFilesPrev({uploadedFiles,removeFile,indexNo} : UploadFilesPrevProps) {
  return (
    <>
      {uploadedFiles.map((file:any, index:any) => {
            if (file.category === indexNo) {
            return <div key={index} className='w-full'>
                <div
                    key={file.id || index}
                    className="flex items-center border px-2 border-slate-400 py-2 justify-between bg-slate-50 rounded-lg !w-full"
                >
                    <div className="flex items-center space-x-3">
                    <div
                        className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        file.category === "assignment-brief"
                            ? "bg-violet-100"
                            : file.category === "module-material"
                            ? "bg-emerald-100"
                            : file.category === "reading-list"
                                ? "bg-amber-100"
                                : "bg-blue-100",
                        )}
                    >
                        {file.type === "PDF" ? (
                        <FileType
                            className={cn(
                            "h-5 w-5",
                            file.category === "assignment-brief"
                                ? "text-violet-600"
                                : file.category === "module-material"
                                ? "text-emerald-600"
                                : file.category === "reading-list"
                                    ? "text-amber-600"
                                    : "text-blue-600",
                            )}
                        />
                        ) : file.type === "DOC" ? (
                        <FileText
                            className={cn(
                            "h-5 w-5",
                            file.category === "assignment-brief"
                                ? "text-violet-600"
                                : file.category === "module-material"
                                ? "text-emerald-600"
                                : file.category === "reading-list"
                                    ? "text-amber-600"
                                    : "text-blue-600",
                            )}
                        />
                        ) : (
                        <BookOpen
                            className={cn(
                            "h-5 w-5",
                            file.category === "assignment-brief"
                                ? "text-violet-600"
                                : file.category === "module-material"
                                ? "text-emerald-600"
                                : file.category === "reading-list"
                                    ? "text-amber-600"
                                    : "text-blue-600",
                            )}
                        />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-slate-800 text-sm">{file.name} <span className="text-xs text-slate-500">{file.size}</span></p>
                        <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                            {file.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                            {file.category === "assignment-brief"
                            ? "Brief"
                            : file.category === "module-material"
                                ? "Module"
                                : file.category === "reading-list"
                                ? "Reading"
                                : "Other"}
                        </Badge>
                        </div>
                    </div>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => removeFile(file.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                    </div>
                </div>
            </div>
            }
        })}
    </>
  )
}
