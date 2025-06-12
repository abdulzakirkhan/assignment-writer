import type { AssignmentDetails } from "@/types/assignment"
import { v4 as uuidv4 } from "uuid"

export const generateMockAssignment = (referenceStyle = "Harvard", wordCount = 2500): AssignmentDetails => {
  const sections = [
    {
      id: uuidv4(),
      title: "Introduction",
      content: `Artificial Intelligence (AI) represents one of the most transformative technological developments of the 21st century, fundamentally reshaping how we approach problem-solving, decision-making, and human-computer interaction across virtually every sector of society. From its theoretical foundations in the mid-20th century to its current applications in machine learning, natural language processing, and autonomous systems, AI has evolved from a speculative concept into a practical reality that influences daily life in ways both visible and invisible.

The significance of AI extends far beyond its technical capabilities, encompassing profound implications for economic structures, social relationships, ethical frameworks, and the very nature of human intelligence itself. As we stand at the threshold of an era where artificial systems can perform tasks previously thought to be exclusively human domains, it becomes crucial to examine not only what AI can accomplish, but also how its development and deployment affect society at large.

This analysis explores the multifaceted impact of artificial intelligence on modern society, examining its historical development, current applications, and future implications. Through a comprehensive review of technological advances, economic transformations, and social changes, this paper aims to provide a balanced perspective on both the opportunities and challenges presented by AI technologies. The discussion encompasses various domains including healthcare, education, employment, privacy, and governance, while considering the ethical dimensions that must guide responsible AI development.`,
      wordCount: Math.floor(wordCount * 0.12),
    },
    {
      id: uuidv4(),
      title: "Historical Development and Technological Foundations",
      content: `The conceptual origins of artificial intelligence can be traced back to ancient philosophical inquiries about the nature of thought and reasoning, but its formal emergence as a scientific discipline began in the 1950s with the pioneering work of researchers like Alan Turing, John McCarthy, and Marvin Minsky. Turing's seminal 1950 paper "Computing Machinery and Intelligence" introduced the famous Turing Test, establishing a benchmark for machine intelligence that continues to influence AI research today.

The field experienced several distinct phases of development, including the initial optimism of the 1950s and 1960s, followed by periods of reduced funding and interest known as "AI winters" in the 1970s and 1980s. These cycles reflected the gap between ambitious promises and practical limitations of early AI systems, which struggled with computational constraints and limited understanding of cognitive processes.

The resurgence of AI in the 1990s and 2000s was driven by advances in computational power, the availability of large datasets, and breakthroughs in machine learning algorithms, particularly neural networks and deep learning. The development of the internet provided unprecedented access to data, while improvements in processing capabilities enabled the training of increasingly sophisticated models.

Contemporary AI systems leverage multiple approaches including symbolic reasoning, statistical learning, and neural network architectures. Deep learning, in particular, has revolutionized fields such as computer vision, natural language processing, and speech recognition, enabling applications that seemed impossible just decades ago. The convergence of big data, cloud computing, and algorithmic innovations has created an environment where AI can tackle complex real-world problems with remarkable effectiveness.`,
      wordCount: Math.floor(wordCount * 0.18),
    },
    {
      id: uuidv4(),
      title: "Current Applications and Sectoral Impact",
      content: `The practical applications of artificial intelligence have expanded dramatically across numerous sectors, demonstrating both the versatility and transformative potential of these technologies. In healthcare, AI systems assist in medical diagnosis, drug discovery, personalized treatment planning, and surgical procedures. Machine learning algorithms can analyze medical images with accuracy that matches or exceeds human specialists, while predictive models help identify patients at risk of developing serious conditions.

The financial services industry has embraced AI for fraud detection, algorithmic trading, credit scoring, and customer service automation. These applications have improved efficiency, reduced costs, and enhanced security, though they have also raised concerns about algorithmic bias and the concentration of market power in automated systems.

Transportation represents another domain of significant AI impact, with autonomous vehicles promising to revolutionize mobility while raising questions about safety, liability, and employment displacement. Current applications range from advanced driver assistance systems to fully autonomous vehicles being tested in controlled environments.

In education, AI-powered platforms provide personalized learning experiences, automated grading, and intelligent tutoring systems that adapt to individual student needs. These tools have the potential to democratize access to high-quality education while raising concerns about privacy and the role of human teachers.

The entertainment and media industries utilize AI for content recommendation, automated content generation, and audience analysis. Streaming platforms employ sophisticated algorithms to predict user preferences, while news organizations experiment with AI-generated articles and automated fact-checking systems.

Manufacturing and logistics have been transformed by AI-driven automation, predictive maintenance, and supply chain optimization. These applications have increased efficiency and reduced costs, but have also contributed to concerns about job displacement and the need for workforce retraining.`,
      wordCount: Math.floor(wordCount * 0.25),
    },
    {
      id: uuidv4(),
      title: "Social and Economic Implications",
      content: `The widespread adoption of artificial intelligence technologies has profound implications for social structures, economic systems, and human relationships. One of the most significant concerns relates to employment displacement, as AI systems become capable of performing tasks traditionally carried out by human workers. While historical technological revolutions have ultimately created new types of employment, the pace and scope of AI-driven automation may present unprecedented challenges for workforce adaptation.

Economic inequality represents another critical dimension of AI's social impact. The benefits of AI technologies may be concentrated among those who own and control these systems, potentially exacerbating existing disparities in wealth and opportunity. Access to AI-powered services and tools may become a new form of digital divide, separating those who can leverage these technologies from those who cannot.

The transformation of social interactions through AI-mediated platforms and services raises questions about human agency, privacy, and the nature of authentic relationships. Social media algorithms shape information consumption and social connections, while AI-powered recommendation systems influence consumer behavior and cultural preferences.

Educational systems face the challenge of preparing students for a world where AI capabilities are ubiquitous, requiring new forms of literacy and skills that emphasize creativity, critical thinking, and human-AI collaboration. Traditional educational models may need fundamental restructuring to remain relevant in an AI-enhanced society.

The concentration of AI capabilities in the hands of a few large technology companies raises concerns about market power, democratic governance, and technological sovereignty. The global nature of AI development creates both opportunities for international cooperation and risks of technological dependence and geopolitical competition.`,
      wordCount: Math.floor(wordCount * 0.2),
    },
    {
      id: uuidv4(),
      title: "Ethical Considerations and Governance Challenges",
      content: `The development and deployment of artificial intelligence systems raise fundamental ethical questions that require careful consideration and proactive governance frameworks. Issues of algorithmic bias and fairness have become particularly prominent as AI systems are increasingly used in high-stakes decisions affecting employment, criminal justice, healthcare, and financial services.

Privacy and data protection represent critical concerns in an era where AI systems require vast amounts of personal information to function effectively. The collection, storage, and use of personal data by AI systems challenge traditional notions of privacy and require new regulatory approaches that balance innovation with individual rights.

Transparency and explainability in AI decision-making pose significant challenges, particularly for complex machine learning models whose decision processes may be opaque even to their creators. The "black box" nature of many AI systems raises questions about accountability and the right to understand decisions that affect individuals' lives.

The potential for AI systems to be used for surveillance, manipulation, and control presents risks to democratic values and human autonomy. Authoritarian governments may leverage AI technologies to monitor and control populations, while commercial entities may use AI to manipulate consumer behavior in ways that undermine individual agency.

International cooperation and governance frameworks are essential for addressing the global nature of AI development and deployment. The need for common standards, ethical guidelines, and regulatory approaches requires unprecedented levels of international coordination and cooperation.

The question of AI consciousness and rights represents a longer-term ethical consideration that may become increasingly relevant as AI systems become more sophisticated. The possibility of artificial general intelligence raises profound questions about the moral status of artificial beings and their relationship to human society.`,
      wordCount: Math.floor(wordCount * 0.18),
    },
    {
      id: uuidv4(),
      title: "Conclusion",
      content: `Artificial intelligence represents both an unprecedented opportunity and a significant challenge for human society. Its potential to solve complex problems, enhance human capabilities, and improve quality of life is matched by equally significant risks related to employment displacement, privacy erosion, and the concentration of power in technological systems.

The path forward requires thoughtful consideration of how AI technologies can be developed and deployed in ways that maximize benefits while minimizing harms. This necessitates ongoing dialogue between technologists, policymakers, ethicists, and civil society to ensure that AI development serves human flourishing rather than undermining it.

Success in navigating the AI revolution will depend on our ability to adapt social, economic, and governance structures to the realities of an AI-enhanced world. This includes investing in education and retraining programs, developing robust regulatory frameworks, and fostering international cooperation on AI governance.

Ultimately, the impact of artificial intelligence on society will be determined not by the technology itself, but by the choices we make about how to develop, deploy, and govern these powerful systems. The decisions made today will shape the trajectory of AI development for generations to come, making it essential that we approach these challenges with wisdom, foresight, and a commitment to human values.

The future of AI and society is not predetermined but will be shaped by our collective actions and choices. By engaging thoughtfully with both the opportunities and challenges presented by artificial intelligence, we can work toward a future where these technologies serve to enhance rather than diminish human potential and well-being.`,
      wordCount: Math.floor(wordCount * 0.07),
    },
  ]

  // Calculate actual word count from content
  const actualWordCount = sections.reduce((total, section) => {
    return total + section.content.split(/\s+/).length
  }, 0)

  return {
    id: uuidv4(),
    title: "The Evolution and Impact of Artificial Intelligence in Modern Society",
    wordCount: actualWordCount,
    pageCount: Math.ceil(actualWordCount / 300),
    format: "DOCX",
    references: 25,
    referenceStyle: referenceStyle,
    sections: sections,
    createdAt: new Date(),
  }
}
