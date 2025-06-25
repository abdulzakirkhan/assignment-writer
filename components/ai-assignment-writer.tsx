"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Book,
  Brain,
  Sparkles,
  Trash2,
  Info,
  Settings,
  FileType,
  Loader2,
  ChevronRight,
  Zap,
  BookOpen,
  BookMarked,
  FileSymlink,
  Files,
  Copy,
  RefreshCw,
  FileTextIcon,
  Check,
  X,
  BadgeCheck,
  XCircle,
  Router,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import { processFile } from "@/lib/file-utils"
import { generateMockAssignment } from "@/lib/mock-assignment"
import type {
  AssignmentDetails,
  FileCategory,
  FileInfo,
  GenerationSettings,
  RegenerationOptions,
  AssignmentSection,
} from "@/types/assignment"
import { REFERENCE_STYLES } from "@/types/assignment"
import { downloadAsText, downloadAsHTML, downloadAsDocx, copyToClipboard, downloadAsPdf } from "@/lib/document-utils"
import UploadFilesPrev from "./ui/UploadFilesPrev";
import { Table, TableBody, TableHeader, TableRow } from "./ui/table";
import Image from "next/image";
import Loader from "./Loader";
import { v4 as uuidv4 } from 'uuid';
import {data} from './data.js';
const AIAssignmentWriter = () => {
  const { toast } = useToast()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const assignmentBriefInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const moduleInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const readingListInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const otherInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>

  // State
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([])
  const [assignmentGenerated, setAssignmentGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [assignments, setAssignments] = useState<AssignmentDetails | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    academicStyle: true,
    includeCitations: true,
    includeExamples: true,
    addConclusion: true,
    wordCount: 2000,
    referenceStyle: "Harvard",
    additionalInstructions: "",
    copies: 1,
  })
  const [regenerationOptions, setRegenerationOptions] = useState<RegenerationOptions>({
    changeStyle: false,
    adjustWordCount: false,
    addReferences: false,
    changeFocus: false,
  })
  const [chatInput, setChatInput] = useState("")
  const [isProcessingChat, setIsProcessingChat] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // AI Chat integration
  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    body: {
      assignments,
    },
    onResponse: () => {
      setIsProcessingChat(false)
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get a response. Please try again.",
        variant: "destructive",
      })
      setIsProcessingChat(false)
    },
  })

  const [assignmentFile, setAssignmentFile] = useState<File[] | null>(null)
  const [moduleMaterialFile, setModuleMaterialFile] = useState<File[] | null>(null)
  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: FileCategory) => {
    if (!event.target.files?.length) return

    const files = Array.from(event.target.files)
    // assignment-brief  module-material
    if(category === "assignment-brief"){
      setAssignmentFile(files)
    }
    if(category === "module-material"){
      setModuleMaterialFile(files)
    }
    // Create temporary file entries with uploading status
    const tempFiles: FileInfo[] = files.map((file) => ({
      id: uuidv4(),
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type.includes("pdf") ? "PDF" : file.type.includes("doc") ? "DOC" : "TXT",
      progress: 0,
      status: "uploading",
      category: category,
    }))

    setUploadedFiles((prev) => [...prev, ...tempFiles])

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const tempFile = tempFiles[i]

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === tempFile.id && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
        )
      }, 300)

      try {
        // Process the file
        const processedFile = await processFile(file, category)

        // Update the file entry with the processed data
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === tempFile.id ? { ...processedFile, progress: 100, status: "complete" } : f)),
        )

        clearInterval(progressInterval)
      } catch (error) {

        // Update the file entry with error status
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === tempFile.id ? { ...f, progress: 100, status: "error" } : f)),
        )

        clearInterval(progressInterval)

        toast({
          title: "File Upload Error",
          description: `Failed to process ${file.name}. Please try again.`,
          variant: "destructive",
        })
      }
    }
  }

  // Remove file handler
  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const [apiResponse, setApiResponse] = useState<Response | null>(null)
  const baseUrl = "http://192.168.100.127:8000";

  // Define a type for the assignment generation response
  type AssignmentGenResponse = {
    polished_assignment: any,
    [key: string]: any;
  };


  type section = {
    content:{}
  }
  // Generate assignment handler
  const [assingmentGenResponse, setAssingmentGenResponse] = useState<AssignmentGenResponse | null>(null)
  const [isGenerateAssignments, setIsGenerateAssignments] = useState(false)
  const generateAssignment = async (assignment_id: any) => {
    try {
      setIsGenerateAssignments(true)
      const response = await fetch(`${baseUrl}/generate/${assignment_id}`, {
        method: "GET", 
      });

      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json(); 
      setAssingmentGenResponse(data);
      setActiveTab("preview")
      setIsGenerateAssignments(false)
    } catch (error) {
      setIsGenerateAssignments(false)
    }
  };
  useEffect(() => {
    if(assingmentGenResponse){
      // setAssingmentGenResponse()
      setActiveTab("preview")
    }
  }, [])
  
  // Use mock data as fallback if API fails
  const useMockDataFallback = () => {
    setUseMockData(true)
    generateAssignment(responseData ? responseData?.assignment_id : "")
  }

  // Chat handlers
  const [questionsAnswers, setQuestionsAnswers] = useState<any[]>([])
  const handleChatSubmit = async (assignment_id: string) => {
    if (!chatInput.trim() || isProcessingChat) return;

    setIsProcessingChat(true);

    try {
      const formData= new FormData()
      formData.append('question', chatInput ? chatInput : '')

      const response = await fetch(`${baseUrl}/qna/${assignment_id}`, {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setQuestionsAnswers((prev) => [...prev, data])

    } catch (error) {
      console.error("Error submitting chat:", error);
    } finally {
      setIsProcessingChat(false);
    }
  };
  const [copied, setCopied] = useState(false);
  type AssignmentSection = {
  title: string;
  content: string;
};

type AssignmentDetails = {
  id:string,
  title: string;
  createdAt: Date;
  wordCount: number;
  referenceStyle: string;
  pageCount:number,
  format:any ,
  references: any,
  sections: AssignmentSection[];
};
type handleDownloadData = {
  res: any;
  pdfres: any;
  docxres: any;
  assignmentDetails: any;
};

const convertPolishedAssignmentToDetails = (data: any): AssignmentDetails => {
  const assignment = data?.polished_assignment;
  const sectionsArray: AssignmentSection[] = [];

  // Loop through each main section
  Object.entries(assignment).forEach(([key, item]: [string, any]) => {
    // Skip references — handle them separately
    if (key === "references") return;

    // If content is a string (e.g., "Introduction"), use it directly
    if (typeof item.content === "string") {
      sectionsArray.push({
        title: item.heading,
        content: item.content,
      });
    }

    // If content is an object (e.g., nested subsections like 2.1, 2.2...)
    else if (typeof item.content === "object") {
      Object.values(item.content).forEach((subItem: any) => {
        sectionsArray.push({
          title: `${item.heading} - ${subItem.heading}`,
          content: subItem.content,
        });
      });
    }
  });

  // Handle references
  let references: string[] = [];
  if (Array.isArray(assignment.references)) {
    references = assignment.references;
    sectionsArray.push({
      title: "References",
      content: assignment.references.join("\n"),
    });
  }

  // Final output with all required fields
  return {
    id: data?.assignment_id || "1",
    title: `Assignment on ${data.topic}`,
    createdAt: new Date(),
    wordCount: sectionsArray.reduce(
      (sum, section) => sum + section.content.split(/\s+/).length,
      0
    ),
    referenceStyle: data?.citation_style || "Harvard",
    sections: sectionsArray,
    pageCount: data?.pageCount || 1,
    format: data?.format || "DOCX",
    references: references,
  };
};


  // Download assignment with multiple format options
  const handleDownload = async (format: "txt" | "pdf" | "docx" | "copy" = "docx") => {
    if (!data) return

    setIsDownloading(true)

    try {
      toast({
        title: format === "copy" ? "Copying..." : "Preparing Download...",
        description:
          format === "copy"
            ? "Copying assignment to clipboard."
            : `Preparing your assignment for download as ${format.toUpperCase()}.`,
      })

      const assDetails : any = convertPolishedAssignmentToDetails(data)

      switch (format) {
        case "txt":
          downloadAsText(assDetails)
          break
        case "pdf":
          downloadAsPdf(assDetails)
          break
        case "docx":
          await downloadAsDocx(assDetails)
          break
        case "copy":
        const success = await copyToClipboard(assDetails);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast({
            title: "Copy Failed",
            description: "Failed to copy to clipboard. Please try downloading instead.",
            variant: "destructive",
          });
        }
        break;
      }

      if (format !== "copy") {
        toast({
          title: "Download Complete",
          description: `Your assignment has been downloaded as a ${format.toUpperCase()} file.`,
        })
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: `Failed to download as ${format.toUpperCase()}. Please try another format.`,
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Regenerate assignment
  const regenerateAssignment = async () => {
    if (!assignments) return

    toast({
      title: "Regenerating",
      description: "Your assignment is being regenerated with the selected options.",
    })

    setIsGenerating(true)
    setGenerationProgress(0)
    setActiveTab("generate")

    // Simulate regeneration
    // setTimeout(() => {
    //   generateAssignment()
    // }, 1000)
  }

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && activeTab === "chat") {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, activeTab])

  // Helper function to get file count by category
  const getFilesCountByCategory = (category: FileCategory) => {
    return uploadedFiles.filter((file) => file.category === category).length
  }

  // Helper function to trigger file input click
  const triggerFileInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const toggleDebugMode = () => {
    setDebugMode((prev) => !prev)
    toast({
      title: debugMode ? "Debug Mode Disabled" : "Debug Mode Enabled",
      description: debugMode
        ? "Debug information will no longer be displayed."
        : "Debug information will be displayed in the console and UI.",
    })
  }






  const [filteredFile, setFilteredFile] = useState<FileInfo | null>(null);
  const [moduleFile, setModuleFile] = useState<FileInfo | null>(null);
  const filesLength = uploadedFiles.length;

  useEffect(() => {
    if(!filteredFile){
      setApiResponse(null)
      setAssignments(null)
      setAssignmentGenerated(false)
    }
    if(uploadedFiles.length > 0){
      const file = uploadedFiles.find(file => file.category === "assignment-brief")
      const ModuleFile = uploadedFiles.find(file => file.category === "module-material")
      if(file){
        setFilteredFile(file)
      }
      if(ModuleFile){
        setModuleFile(ModuleFile)
      }
    }
  }, [uploadedFiles])
  
  const [assignmentId, setAssignmentId] = useState(123456891011121314); // Example assignment ID, can be generated dynamically
  const [assignmentType, setAssignmentType] = useState("Essay"); // Default assignment type
  const [assignmentTopic, setAssignmentTopic] = useState("secondary education"); // Default topic
  const [deadline, setDeadline] = useState(Date.now()); // Default deadline
  const handleChangeAssignmentId =(assignmentId:number) => {
    setAssignmentId(assignmentId);
  }
  useEffect(() => {
    if(assignmentId){
      handleChangeAssignmentId(assignmentId)
    }else{
      setAssignmentId(11);
    }
  }, [assignmentId])



  const [isShowSection, setIsShowSection] = useState(false)
  const [sectionData, setSectionData] = useState<AssignmentSection | null>(null)
  const [editSectionText, setEditSectionText] = useState(sectionData?.content || "")

  useEffect(() => {
    if (sectionData !== null && sectionData.content !== undefined) {
      setEditSectionText(sectionData.content)
    }
  }, [sectionData])
  
  const SectionViewer = ({ section, onClose }: { section: any; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-black/20">
        {/* Modal content */}
        <div className="bg-white rounded-lg shadow-lg w-4xl h-[433px] max-w-full p-6 relative">

            <Card key={section?.id} className="border-0 h-full">
              <CardHeader className="px-0">
                <CardTitle className="text-lg">{section?.title}</CardTitle>
              </CardHeader>
              <CardContent className="py-4 h-1/2 !overflow-y-auto rounded-md bg-slate-50 border border-slate-200">
                  {section?.content.split("\n\n").map((paragraph: any, idx: number) => (
                    <p key={idx} className="text-slate-700 mb-4">
                      {paragraph}
                    </p>
                  ))}
              </CardContent>
              <CardFooter className="h-1/3 flex items-center gap-4">
                {/* Close Button */}
                <Button variant="outline" className="cursor-pointer" size="sm" onClick={onClose}>
                  Close
                </Button>
                {/* Save Button */}
                <Button variant="outline" className="cursor-pointer">Save</Button>
                {/* Regenerate Button */}
                <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => regenerateAssignment()}>
                  Regenerate
                </Button>
            </CardFooter>
            </Card>
        </div>
      </div>
    );
  };

  const [assignmentPreview, setAssignmentPreview] = useState(false)
  const [assignmentPreviewData, setAssignmentPreviewData] = useState<AssignmentDetails | null>(null)


  const assignmentsData =[
    {
      createdAt:"Mon Jun 16 2025 10:48:07 GMT+0500 (Pakistan Standard Time)",
      format:"DOCX",
      id:"3e709380-a5c5-4ab7-b850-8031f6f70e",
      pageCount: 8,
      referenceStyle: "Harvard",
      references:"df",
      sections:[
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
      ],
      title:"A Critical Analysis of Agent-Based Modelling in the Context of the AgentApp System",
      wordCount: 2289
    },
    {
      createdAt:"Mon Jun 16 2025 10:48:07 GMT+0500 (Pakistan Standard Time)",
      format:"DOCX",
      id:"3e709380-a5c5-4ab7-8031f6f70e7d",
      pageCount: 8,
      referenceStyle: "Harvard",
      references:"df",
      sections:[
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
      ],
      title:"A Critical Analysis of Agent-Based Modelling in the Context of the AgentApp System",
      wordCount: 2289
    },
    {
      createdAt:"Mon Jun 16 2025 10:48:07 GMT+0500 (Pakistan Standard Time)",
      format:"DOCX",
      id:"3e4ab7-b850-8031f6f70e7d",
      pageCount: 8,
      referenceStyle: "Harvard",
      references:"df",
      sections:[
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
        {
          content: "Agent-based modelling (ABM) has emerged as a powerful computational tool for simulating complex systems composed of interacting autonomous agents.  Unlike traditional mode",
          id:"b79b9b37-76bf-4fc2-a38c-2ed6a10946f9",
          title: "Introduction: Agent-Based Modelling and its Applications",
          wordCount: 363
        },
      ],
      title:"A Critical Analysis of Agent-Based Modelling in the Context of the AgentApp System",
      wordCount: 2289
    },
  ]
  const formatDateForInput = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // returns YYYY-MM-DD
  };


  type AssignmentExtractedData = {
    paper_topic?: string;
    // add other expected properties here as needed
    [key: string]: any;
  };
  const [responseData, setResponseData] = useState<AssignmentExtractedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [additionalInformation, setAdditionalInformation] = useState("")
  // const baseUrl = "http://192.168.100.92:8000"
  // navigate instance
  // const navigate = useNavigate();
  
  const apiCall = async () => {
    try {
      if (assignmentFile && moduleMaterialFile) {
        setLoading(true)
        const formData = new FormData();
        // Append multiple assignment files
        assignmentFile.forEach((file: File) => {
          formData.append("file", file);
        });

        // Append module material file (assuming it's a single file)
        moduleMaterialFile.forEach((file: File) => {
          formData.append("helping_material", file);
        })
        formData.append("additional_information" , additionalInformation || "");
        const response = await fetch(`${baseUrl}/new-assignment`, {
          method: "POST",
          body: formData,
        });
        if(response.ok){
          const data = await response.json();
          setResponseData(data.data);
          setLoading(false)
        } else {
          // Optionally handle other redirect logic here
          setLoading(false)
          console.error("No URL found in response to redirect.")
        }
      }
    } catch (error) {
      console.error("Error fetching assignment details:", error);
      setLoading(false)
    }
  };


  const [isIngestLoading, setIsIngestLoading] = useState(false)
  
  const [ingest, setIngest] = useState(false)
  const handleIngest = async (assignment_id: string) => {
    try {
      setIsIngestLoading(true)
      const response = await fetch(`${baseUrl}/ingest_assignment/${assignment_id}`, { 
        method: "GET",
      });

      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setIsIngestLoading(false)
      setIngest(data ? true :false)
      console.log("data",data)
    } catch (error) {
      setIsIngestLoading(false)
    }
  };


  const handleRefineText = async () => {
    try {
      const assignmentText=convertPolishedAssignmentToDetails(data)
      const formData = new FormData();
      formData.append("topic",data?.topic)
      formData.append("assignment_id", String(data?.assignment_id))
      formData.append("university_name",data?.university_name)
      formData.append("assignment_text", String(assignmentText))
      // formData.append("polished_assignment",data.polished_assignment)
      const response = await fetch(`${baseUrl}/refineText`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const resData = await response.json();
      console.log(resData)
    } catch (error) {
      console.log("error :",error)
    }
  }
  console.log("assingmentGenResponse :",assingmentGenResponse)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2.5 rounded-xl">
                {/* <Brain className="h-6 w-6 text-white" /> */}
                <Image src={"/logo.png"} width={100} height={100} alt="Egeeks Global" className="" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Assignment Writer
                </h1>
                <p className="text-slate-600 text-xs">Intelligent Academic Content Generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-slate-700">Powered by AI Team</span>
              </div>
            </div>
          </div>
        </div>
      </header>

        {loading && (
          <Loader text={"Procccess Documents"} />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Main Tabs */}
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto mb-8">
              <TabsTrigger value="upload" className="flex cursor-pointer items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="generate" disabled={responseData ? false : true} className="flex cursor-pointer items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Generate</span>
              </TabsTrigger>
              {/* <TabsTrigger value="assignment" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Assingment</span>
              </TabsTrigger> */}
              <TabsTrigger value="preview" disabled={data ? false :true} className="flex cursor-pointer items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={assingmentGenResponse ? false : true} className="flex cursor-pointer items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Q&A Chat</span>
              </TabsTrigger>
            </TabsList>
                {/* Upload Tab Content */}
                <TabsContent value="upload">
                  <>
                  <div className={`grid ${responseData === null ? "md:grid-cols-2" : "md:grid-cols-3"} gap-8`}>
                      {/* Assignment Brief Upload */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <FileSymlink className="h-5 w-5 mr-2 text-violet-600" />
                            Assignment Brief
                          </CardTitle>
                          <CardDescription>Upload your assignment requirements and instructions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-violet-500 transition-colors">
                            <input
                              type="file" required
                              multiple
                              onChange={(e) => handleFileUpload(e, "assignment-brief")}
                              className="hidden"
                              id="assignment-brief-upload"
                              ref={assignmentBriefInputRef}
                              accept=".pdf,.doc,.docx,.txt,.zip"
                            />
                            <div
                              className="text-center cursor-pointer"
                              onClick={() => triggerFileInput(assignmentBriefInputRef)}
                            >
                              <FileText className="mx-auto h-8 w-8 text-violet-500 mb-2" />
                              <p className="text-sm font-medium text-slate-700">Upload Assignment Brief</p>
                              <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, TXT</p>

                              {getFilesCountByCategory("assignment-brief") > 0 && (
                                <Badge variant="secondary" className="mt-2">
                                  {getFilesCountByCategory("assignment-brief")} file(s) uploaded
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-6 py-6 -mt-5 w-full">                    
                          <div className="flex w-full flex-col gap-3 max-h-[160px] overflow-y-auto">
                          <UploadFilesPrev
                            uploadedFiles={uploadedFiles.map(file => ({
                              ...file,
                              type:
                                file.type === "PDF"
                                  ? "PDF"
                                  : file.type === "DOC"
                                  ? "DOC"
                                  : file.type === "DOCS"
                                  ? "DOCS"
                                  : "OTHER",
                            }))}
                            removeFile={removeFile}
                            indexNo={"assignment-brief"}
                          />
                          </div>
                        </CardFooter>
                      </Card>

                      {/* Module Material Upload */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <BookMarked className="h-5 w-5 mr-2 text-emerald-600" />
                            Module Material
                          </CardTitle>
                          <CardDescription>Upload lecture notes, slides, and course materials</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-emerald-500 transition-colors">
                            <input
                              type="file"
                              multiple required
                              onChange={(e) => handleFileUpload(e, "module-material")}
                              className="hidden"
                              id="module-material-upload"
                              ref={moduleInputRef}
                              accept=".pdf,.doc,.docx,.txt,.zip"
                            />
                            <div className="text-center cursor-pointer" onClick={() => triggerFileInput(moduleInputRef)}>
                              <Book className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                              <p className="text-sm font-medium text-slate-700">Upload Module Material</p>
                              <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, TXT</p>

                              {getFilesCountByCategory("module-material") > 0 && (
                                <Badge variant="secondary" className="mt-2">
                                  {getFilesCountByCategory("module-material")} file(s) uploaded
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-6 py-6 -mt-5 w-full">       
                          <div className="flex flex-col w-full gap-3 max-h-[160px] overflow-y-auto">
                            <UploadFilesPrev
                              uploadedFiles={uploadedFiles.map(file => ({
                                ...file,
                                type:
                                  file.type === "PDF"
                                    ? "PDF"
                                    : file.type === "DOC"
                                    ? "DOC"
                                    : file.type === "DOCS"
                                    ? "DOCS"
                                    : "OTHER",
                              }))}
                              removeFile={removeFile}
                              indexNo={"module-material"}
                            />
                          </div>             
                        </CardFooter>
                      </Card>

                    
                      {/* Provided Materials */}

                      {responseData && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <FileTextIcon className="h-5 w-5 mr-2 text-violet-600" />
                              Provided Assignment
                            </CardTitle>
                            <CardDescription>Provided reference, papers topic, paper type deadline</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 space-y-3">
                              {/* Paper Topic row */}
                              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1">
                                <span className="text-sm text-gray-600">Paper Topic</span>
                                {responseData?.paper_topic ? responseData?.paper_topic : <XCircle className="h-4 w-4 text-red-600" />}
                              </div>
                              {/* Paper Topic row */}
                              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1">
                                <span className="text-sm text-gray-600">Assignment Type</span>
                                {responseData?.assignment_type ? responseData?.assignment_type : <BadgeCheck className="h-4 w-4 text-green-600" />}
                              </div>
                              {/* Deadline row */}
                              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1">
                                <span className="text-sm text-gray-600">Deadline</span>
                                {responseData?.deadline ? responseData?.deadline : <BadgeCheck className="h-4 w-4 text-green-600" />}
                              </div>

                              {/* Paper Topic row */}
                              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1">
                                <span className="text-sm text-gray-600">Reference Style</span>
                                {responseData?.citation_style ? responseData?.citation_style : <XCircle className="h-4 w-4 text-red-600" />}
                              </div>
                              {/* Paper Topic row */}
                              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1">
                                <span className="text-sm text-gray-600">Word Count</span>
                                {responseData?.word_count ? responseData?.word_count : <XCircle className="h-4 w-4 text-red-600" />}
                              </div>
                              {/* Paper Topic row */}
                              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1">
                                <span className="text-sm text-gray-600">Unversity Name</span>
                                {responseData?.university_name ? responseData?.university_name : <BadgeCheck className="h-4 w-4 text-green-600" />}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="px-6 -mt-5">
                          </CardFooter>
                        </Card>
                      )}
                    

                  </div>
                  <div className="grid grid-cols-1">
                    <div className="mt-4">
                      {/* border to input */}
                      <textarea rows={5} value={additionalInformation} onChange={(e) => setAdditionalInformation(e.target.value)} placeholder="Additional Information" className="w-full p-2 border border-gray-300 rounded-md focus:border-gray-500 outline-0" style={{resize:"none"}} />
                    </div>
                  </div>
                  <div className="flex items-center justify-center pt-2">
                    {assignmentFile && moduleMaterialFile && !responseData && (
                      <Button
                        className="bg-gradient-to-r cursor-pointer from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        onClick={apiCall}
                      >
                        Click To Proccess
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) }
                    {responseData && (
                      <Button variant="outline" className="cursor-pointer" onClick={() => setActiveTab("generate")}>Next</Button>
                    )}         
                  </div>
                  </>
                </TabsContent>

                {/* Generate Tab Content */}
                <TabsContent value="generate">
                  <Card className="max-w-3xl mx-auto">
                    <CardContent className="p-8">
                      <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full flex items-center justify-center mb-5">
                          <Sparkles className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Generate Assignment</h3>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">
                          Our AI will analyze your uploaded files and generate a comprehensive, well-structured assignment
                        </p>
                      </div>

                      {apiError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-red-800">API Error Detected</h4>
                              <p className="text-xs text-red-700 mt-1">{apiError}</p>
                              <div className="mt-3 flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-white"
                                  onClick={() => {
                                    setApiError(null)
                                    setRetryCount((prev) => prev + 1)
                                    // generateAssignment()
                                  }}
                                >
                                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                  Retry
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-white"
                                  onClick={useMockDataFallback}
                                >
                                  Use Sample Data
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {isIngestLoading && (
                        <Loader text={"Ingest to Knowledge Base / Step 1"} />
                      )}

                      {isGenerateAssignments && (
                        <Loader text={"Generate Assignment / Step 2"} />
                      )}

                      {!assignmentGenerated && !isGenerating && (
                        <div className="space-y-6">
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-medium text-slate-800 mb-3 flex items-center">
                              <Settings className="h-4 w-4 mr-2 text-slate-600" />
                              Generation Settings
                            </h4>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* assignment id */}
                              <div className="w-full">
                                <label className="text-xs font-medium text-slate-700">Assignment ID</label>
                                <Input
                                  disabled={responseData ? true : false}
                                  value={responseData ? responseData?.assignment_id :assignmentId}
                                  onChange={(e) => handleChangeAssignmentId(Number(e.target.value))}
                                  className="h-8 text-xs"
                                  type="text"
                                  placeholder="Enter assignment ID"
                                />
                              </div>
                              <div className="w-full">
                                <label className="text-xs font-medium text-slate-700">Assignment Type</label>
                                <Input
                                  disabled={responseData ? true : false}
                                  value={responseData ? responseData?.assignment_type : assignmentType}
                                  onChange={(e) => setAssignmentType(e.target.value)}
                                  className="h-8 text-xs"
                                  type="text"
                                  placeholder="Enter assignment ID"
                                />
                              </div>
                              <div className="w-full">
                                <label className="text-xs font-medium text-slate-700">Assignment Topic</label>
                                <Input
                                  disabled={responseData ? true : false}
                                  value={responseData ? responseData?.paper_topic : assignmentTopic}
                                  onChange={(e) => setAssignmentTopic(e.target.value)}
                                  className="h-8 text-xs"
                                  type="text"
                                  placeholder="Enter assignment ID"
                                />
                              </div>
                              <div className="w-full">
                                <label className="text-xs font-medium text-slate-700">Assignment Deadline</label>
                                <Input
                                  disabled={responseData ? true : false}
                                  // onclick will open date picker
                                  onClick={() => { setTimeout(() => {
                                      const input = document.querySelector('input[type="date"]') as HTMLInputElement;
                                      if (input) input.showPicker();
                                    }, 0);
                                  }}
                                  // value={formatDateForInput(deadline)}
                                  value={responseData ? responseData?.deadline : formatDateForInput(deadline)}
                                  onChange={(e) => setDeadline(new Date(e.target.value).getTime())}
                                  className="h-8 text-xs"
                                  type={responseData ? "text" : "date"}
                                />
                              </div>
                            </div>  
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Word Count <span className="text-xl text-red-500 inline-flex align-middle">*</span> </label>
                                <div className="flex flex-col space-x-2">
                                  <Input
                                    disabled={responseData ? true : false}
                                    value={responseData ? responseData?.word_count : generationSettings.wordCount}
                                    onChange={(e) =>
                                      setGenerationSettings({
                                        ...generationSettings,
                                        wordCount: Number.parseInt(e.target.value),
                                      })
                                    }
                                    className="h-8 text-xs"
                                    type="number"
                                    min={500}
                                    max={10000}
                                  />
                                  {/* <span className="text-xs text-slate-500">words</span> */}
                                  {/* {generationSettings.wordCount < 500 && (
                                    <p className="text-red-500 text-xs mt-3">Word count must be at least 500</p>
                                  )} */}
                                  { responseData ? responseData?.word_count < 500 : generationSettings.wordCount < 500 && (
                                    <p className="text-red-500 text-xs mt-3">Word count must be at least 500</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Reference Style</label>
                                <Select
                                disabled={responseData ? true : false}
                                  value={responseData ? responseData?.citation_style : generationSettings.referenceStyle}
                                  onValueChange={(value) =>
                                    setGenerationSettings({
                                      ...generationSettings,
                                      referenceStyle: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select style" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {REFERENCE_STYLES.map((style) => (
                                      <SelectItem key={style} value={style} className="text-xs">
                                        {style}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* <div className="mt-4 space-y-1">
                              <label className="text-xs font-medium text-slate-700">Additional Instructions</label>
                              <Textarea
                                placeholder="Enter any specific requirements or preferences..."
                                value={generationSettings.additionalInstructions}
                                onChange={(e) =>
                                  setGenerationSettings({
                                    ...generationSettings,
                                    additionalInstructions: e.target.value,
                                  })
                                }
                                className="text-xs min-h-[60px]"
                              />
                            </div> */}

                            <div className="mt-4 flex items-center space-x-4">
                              <div className="space-y-1 flex-1">
                                <label className="text-xs font-medium text-slate-700">Number of Copies</label>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={generationSettings.copies}
                                    onChange={(e) =>
                                      setGenerationSettings({
                                        ...generationSettings,
                                        copies: Number.parseInt(e.target.value),
                                      })
                                    }
                                    className="h-8 text-xs"
                                    type="number"
                                    min={1}
                                    max={5}
                                  />
                                  <div className="flex items-center space-x-1">
                                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                                    <span className="text-xs text-slate-500">copies</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="bg-amber-50 p-2 rounded-md border border-amber-100">
                                  <div className="flex items-start space-x-2">
                                    <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5" />
                                    <p className="text-xs text-amber-800">
                                      Multiple copies will generate unique variations of the same assignment
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                              <Button disabled={ingest ? true : false} className="bg-gradient-to-r cursor-pointer from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 px-8 py-6 h-auto text-base border-0 mt-1" variant="outline" onClick={(e) => handleIngest(responseData ? responseData?.assignment_id : assignmentId)}>Ingest to Knowledge base / step 1</Button>
                              <Button
                                onClick={() => generateAssignment(responseData ? responseData.assignment_id : null)}
                                disabled={
                                  (uploadedFiles.length === 0 && !useMockData && !debugMode) ||
                                  generationSettings.wordCount < 500
                                }
                                className="bg-gradient-to-r cursor-pointer from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 px-8 py-6 h-auto text-base"
                              >
                                <Zap className="mr-2 h-5 w-5" />
                                Generate Assignment / Step 2
                              </Button>

                              {debugMode && (
                                <Button
                                  onClick={useMockDataFallback}
                                  variant="outline"
                                  className="px-8 py-6 h-auto text-base"
                                >
                                  Use Sample Data
                                </Button>
                              )}
                            </div>

                            {uploadedFiles.length === 0 && !useMockData && !debugMode && (
                              <p className="text-red-500 text-xs mt-3">Please upload files first</p>
                            )}
                            
                          </div>
                        </div>
                      )}

                      {isGenerating && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <div className="inline-flex items-center space-x-3 bg-sky-50 px-5 py-3 rounded-lg">
                              <Loader2 className="h-5 w-5 text-sky-600 animate-spin" />
                              <span className="text-sky-600 font-medium text-sm">Generating your assignment...</span>
                            </div>
                          </div>

                          <Progress value={generationProgress} className="h-2" />

                          <p className="text-slate-600 text-sm text-center">
                            Please be patient, this may take a few minutes.
                          </p>

                          {debugMode && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <h4 className="text-xs font-semibold text-slate-700 mb-2">Debug Information</h4>
                              <div className="space-y-1 text-xs text-slate-600">
                                <p>API Key Status: {process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "Available" : "Not Found"}</p>
                                <p>Files Count: {uploadedFiles.length}</p>
                                <p>Word Count: {generationSettings.wordCount}</p>
                                <p>Reference Style: {generationSettings.referenceStyle}</p>
                                <p>Retry Count: {retryCount}</p>
                                <div className="flex space-x-2 mt-2">
                                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={useMockDataFallback}>
                                    Use Sample Data
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {assignmentGenerated && assignments && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Assignment Generated!</h3>
                            <p className="text-slate-600 text-sm">
                              Your AI-generated assignment is ready for preview and download.
                            </p>

                            <div className="mt-6 flex justify-center space-x-3">
                              <Button onClick={() => setActiveTab("preview")}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Assignment
                              </Button>
                              <Button variant="outline" onClick={() => handleDownload("docx")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Download DOCX
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* assignment Tab Content */}
                <TabsContent value="assignment">
                  {assignmentsData ? (
                    <Table className="">
                          <TableHeader className="">
                            <TableRow>
                              <th className="px-6 py-3 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                              <th className="px-6 py-3 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                              <th className="px-6 py-3 border border-gray-300  text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                      {
                        assignmentsData.map((assignment:any,index) => (
                          <TableRow key={assignment.id}>
                            <td className="px-6 border border-gray-300 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                            <td className="px-6 border border-gray-300 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.title}</td>
                            <td className="px-6 border border-gray-300 py-4 whitespace-nowrap text-sm text-right space-x-2">
                              <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => {
                                  setAssignmentPreview(true);
                                  setAssignmentPreviewData(assignment);
                                  setActiveTab("preview");
                                }}
                              >
                                Preview
                              </Button>
                            </td>
                          </TableRow>
                        ))
                      }
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-24">
                      <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 text-sm">No assignment generated yet</p>
                      <p className="text-slate-400 text-xs mt-1">Generate an assignment to preview it here</p>
                    </div>
                  )}
                </TabsContent>

                {/* Preview Tab Content */}
                <TabsContent value="preview">
                  {/* {assignmentPreview && assignmentPreviewData ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">Assignment Preview</h3>
                        <div className="flex items-center space-x-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("copy")}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copied ? "Copied !" : "Copy Text"}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy the assignment text to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("txt")}>
                            Download TXT
                          </Button>
                          <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("html")}>
                            Download HTML
                          </Button>
                          <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("docx")}>
                            Download DOCX
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="p-6 prose max-w-none">
                            <h2 className="text-2xl font-bold text-center mb-4">{assignmentPreviewData?.title}</h2>
                            {assignmentPreviewData?.sections &&
                              assignmentPreviewData?.sections.map((section) => (
                                <div key={section.id} className="mb-8">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-semibold text-slate-800 mb-3">{section.title}</h4>
                                    <Button variant="outline" className="cursor-pointer" onClick={() => {
                                      setIsShowSection(!isShowSection);
                                      setSectionData(section);
                                    }}>Edit</Button>
                                  </div>
                                  {section.content.split("\n\n").map((paragraph, idx) => (
                                    <p key={idx} className="text-slate-700 mb-4">
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={() => {
                          setFilteredFile(null)
                          setAssignmentPreview(false)
                          setAssignmentPreviewData(null)
                          setApiResponse(null)
                          setActiveTab("upload")
                        }}>
                          Generate New Assignemts
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-24">
                      <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 text-sm">No assignment generated yet</p>
                      <p className="text-slate-400 text-xs mt-1">Generate an assignment to preview it here</p>
                    </div>
                  )} */}

                  {
                    assingmentGenResponse && (
                      <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">Assignment Preview</h3>
                        <div className="flex items-center space-x-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("copy")}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copied ? "Copied !" : "Copy Text"}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy the assignment text to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("txt")}>
                                  Download TXT
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download in TXT</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("pdf")}>
                                  Download PDF
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download in PDF</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => handleDownload("docx")}>
                                  Download DOCX
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download in DOCX</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                        <div className="my-3">
                          <h2 className="font-bold text-lg lg:text-2xl">{assingmentGenResponse?.topic}</h2>
                          {/* <div className="mt-3 flex items-center gap-4"><h3 className="text-lg font-bold lg:text-2xl">{data?.university_name}</h3> </div> */}
                        </div>
                        {Object.entries(assingmentGenResponse?.polished_assignment)
                          .filter(([key]) => key !== "references")
                          .map(([key, section]) => {
                            const typedSection = section as {
                              heading: string;
                              content: string | Record<string, { heading: string; content: string }>;
                            };

                            return (
                              <div key={key} className="mb-6">
                                <h2 className="text-xl font-bold mb-2">{typedSection.heading}</h2>

                                {/* If content is a string, render it as a paragraph */}
                                {typeof typedSection.content === "string" ? (
                                  <p className="text-gray-800 whitespace-pre-line">
                                    {typedSection.content}
                                  </p>
                                ) : (
                                  // If content is an object, map over its entries and show subKey (e.g., 2.1, 2.2)
                                  Object.entries(typedSection.content).map(([subKey, subSection]) => (
                                    <div key={subKey} className="ml-4 mb-4">
                                      <h3 className="text-lg font-semibold mb-1 flex gap-2 items-start">
                                        <span className="text-gray-500 min-w-[3rem]">{subKey}</span>
                                        <span>{subSection.heading}</span>
                                      </h3>
                                      <p className="text-gray-700 whitespace-pre-line">
                                        {subSection.content}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            );
                          })}

                        <div className="">
                          <h1 className="text-lg lg:text-2xl font-bold mb-2">References</h1>
                            <ul className="list-disc list-inside px-3">
                              {Object.entries(assingmentGenResponse?.polished_assignment?.references || {}).map(
                                ([key, value], index) => (
                                  <li key={index}>
                                    {value}
                                  </li>
                                )
                              )}
                            </ul>
                        </div>

                        <div className="flex justify-end items-center">
                          <Button variant="outline" className="cursor-pointer" onClick={handleRefineText}>Refine Text</Button>
                        </div>
                      </>
                    )
                  }
                </TabsContent>

                {/* Chat Tab Content */}
                <TabsContent value="chat">
                  <div className="space-y-4">
                    <div
                      ref={chatContainerRef}
                      className="h-[500px] p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-y-auto"
                    >
                      {questionsAnswers.length === 0 ? (
                        <div className="text-center py-24">
                          <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                          <p className="text-slate-500 text-sm">No messages yet</p>
                          <p className="text-slate-400 text-xs mt-1">Start a conversation to get help</p>
                        </div>
                      ) : (
                        questionsAnswers.map((message, index) => (
                          <>
                          <div
                            key={index}
                            className={`mb-3 p-3 rounded-lg ${message.question ? "bg-blue-100" : "bg-slate-100"}`}
                          >
                            <p className="text-sm text-slate-800">{message.question}</p>
                          </div>
                          <div
                            key={index}
                            className={`mb-3 p-3 rounded-lg ${message.answer ? "bg-blue-300" : "bg-slate-100"}`}
                          >
                            <p className="text-sm text-slate-800">{message.answer}</p>
                          </div>

                          </>
                        ))
                      )}

                      {isLoading && (
                        <div className="mb-3 p-3 rounded-lg bg-slate-100">
                          <Loader2 className="h-4 w-4 text-slate-600 animate-spin mr-2 inline-block" />
                          <span className="text-sm text-slate-800">Thinking...</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <Input
                        type="text"
                        placeholder="Ask a question about the assignment..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleChatSubmit(responseData ? responseData.assignment_id : null);
                          }
                        }}
                      />
                      <Button onClick={() => handleChatSubmit(responseData ? responseData?.assignment_id : "")} disabled={isProcessingChat}>
                        {isProcessingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

          </Tabs>
        </div>


      {isShowSection && (
        <SectionViewer section={sectionData} onClose={() => setIsShowSection(!isShowSection)} />
      )}

    </div>
  )
}

export default AIAssignmentWriter;