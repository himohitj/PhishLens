import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Mail,
  Smartphone,
  QrCode,
  MessageSquare,
  Globe,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Flag,
  Archive,
  Reply,
  ExternalLink,
  Paperclip,
  XCircle,
  Camera,
  PhoneCall,
  BookOpen,
  RotateCcw,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  SessionStateResponse,
  SimulationFeedbackRecord,
} from '../types/phishlens.ts';
import { evaluateSimulationDecisionSync } from '../lib/sessionStore.ts';

interface SimulationPageProps {
  scenarioId: string;
  session: SessionStateResponse;
  onInspectEvidence: (scenarioId: string, evidenceId: string) => void;
  onUpdateRoomTask: (scenarioId: string, stepIndex: number) => void;
  onDecisionRecorded: (feedback: SimulationFeedbackRecord) => void;
  navigate: (path: string) => void;
}

interface RoomTaskDefinition {
  stepNumber: number;
  title: string;
  instruction: string;
  interactionPrompt: string;
  hintText: string;
  feedbackHeadline: string;
  feedbackBody: string;
  whyItMattersDetail: string;
  evidenceIdToRecord?: string;
}

interface RoomDefinition {
  id: string;
  roomCode: string;
  roomTitle: string;
  durationLabel: string;
  nextRoomTeaser: string;
  briefing: string;
  tasks: RoomTaskDefinition[];
  revealSummary: {
    suspiciousSignals: string[];
    keyLessonTitle: string;
    keyLessonBody: string;
    practicalRule: string;
  };
}

const ROOM_DEFINITIONS: Record<string, RoomDefinition> = {
  'sim-1': {
    id: 'sim-1',
    roomCode: 'Room 01 of 05',
    roomTitle: "The Message That Can't Wait",
    durationLabel: '~3 mins',
    nextRoomTeaser:
      'Next up in Room 02: You click a shared document link and a sign-in page appears. Learn how to tell whether a login screen deserves your trust.',
    briefing:
      "You've just opened your work inbox on Tuesday morning. One message has an urgent warning saying your account will be suspended in 2 hours. Before clicking anything, let's investigate it step by step.",
    tasks: [
      {
        stepNumber: 1,
        title: 'Open the flagged email',
        instruction:
          'Look at your inbox list on the left and click the urgent message from "Northstar Security Operations" to open it in the reading pane.',
        interactionPrompt: 'Click the flagged message in the inbox list to begin.',
        hintText: 'Click the first message at the top of the Inbox list on the left side of the email client.',
        feedbackHeadline: 'Good start — notice the 2-hour countdown pressure.',
        feedbackBody:
          'The message threatens to lock your account in 120 minutes. Scammers love tight deadlines because panic makes people act before checking details.',
        whyItMattersDetail:
          'Real IT teams rarely delete or lock an active employee account with only two hours of notice and no prior warning.',
        evidenceIdToRecord: 'ev-1-urgency',
      },
      {
        stepNumber: 2,
        title: 'Inspect who actually sent it',
        instruction:
          'The display name says "Northstar Security Operations", which sounds official. Click the sender address or "Inspect Sender Details" inside the email header to see where it really came from.',
        interactionPrompt: 'Click "Inspect Sender Details" in the email header.',
        hintText: 'Look right below the email subject line and click the button labeled "Inspect Sender Details".',
        feedbackHeadline: 'Clue discovered — the sender address does not match the display name.',
        feedbackBody:
          'Anyone can type "Northstar Security" as their display name. Expanding the details reveals a lookalike domain ("northstar-id-verify.example.com") and a completely different reply address.',
        whyItMattersDetail:
          'Email apps often hide the full email address to keep the screen tidy. Expanding the sender header is the fastest way to spot an impersonator.',
        evidenceIdToRecord: 'ev-1-sender',
      },
      {
        stepNumber: 3,
        title: 'Preview the link destination',
        instruction:
          'Now check where the "Keep My Account Active" button actually leads—without opening the website. Click "Preview Link Address" (or hover over the button) to inspect the web address.',
        interactionPrompt: 'Click "Preview Link Address" next to the button in the email.',
        hintText: 'Look at the bottom of the email message and click "Preview Link Address".',
        feedbackHeadline: 'Nice catch — the link leads to an unrelated website.',
        feedbackBody:
          'Although "northstar.example.com" appears at the beginning of the link, the actual website you would visit is "session-check-auth.example.net" right before the first single slash (/).',
        whyItMattersDetail:
          'Scammers put familiar company names at the start of a web address as a decoy. The real website owner is always shown right before the first single forward slash (/).',
        evidenceIdToRecord: 'ev-1-link',
      },
      {
        stepNumber: 4,
        title: 'Decide what to do',
        instruction:
          'You have examined the urgency, the sender address, and the link destination. Choose how you want to handle this email.',
        interactionPrompt: 'Select one of the response actions below.',
        hintText: 'Think about which option protects both you and your coworkers without interacting with the scammer.',
        feedbackHeadline: 'Decision recorded.',
        feedbackBody: 'Let’s review what your choice means and what to remember.',
        whyItMattersDetail: '',
      },
    ],
    revealSummary: {
      suspiciousSignals: [
        'A 120-minute countdown designed to rush you into clicking.',
        'The sender address used a lookalike domain ("northstar-id-verify.example.com") and routed replies to an external server.',
        'The button link actually pointed to "session-check-auth.example.net", using the company name only as a prefix.',
      ],
      keyLessonTitle: 'Why Display Names and Urgent Buttons Are Easy to Fake',
      keyLessonBody:
        'An email’s friendly display name and visual styling are just text formatting—anyone can copy them. Whenever an email pressures you with an urgent deadline, slow down and inspect the real sender address and the web domain before the first single slash (/).',
      practicalRule:
        'Never use a link inside an unexpected security email to sign in; open your own saved bookmark or report the message.',
    },
  },

  'sim-2': {
    id: 'sim-2',
    roomCode: 'Room 02 of 05',
    roomTitle: 'The Suspicious Sign-In',
    durationLabel: '~3 mins',
    nextRoomTeaser:
      'Next up in Room 03: A text message says your parcel delivery is on hold for a tiny $1.85 fee. Learn how mobile messaging traps work.',
    briefing:
      'You clicked a shared document link. A sign-in page has appeared. Your colleague says the document is urgent. Before continuing, check whether this page deserves your trust.',
    tasks: [
      {
        stepNumber: 1,
        title: 'Inspect the web address',
        instruction:
          "Look at the browser address bar at the top of the window. Click the address bar to inspect the full domain and see which website you're actually visiting.",
        interactionPrompt: 'Click the address bar at the top of the simulated browser window.',
        hintText: 'Click directly on the dark address bar showing "https://sso-northstar-cloud..." at the top of the browser mockup.',
        feedbackHeadline:
          'Good investigation. The page uses HTTPS, but that only encrypts the connection. It does not prove the website is legitimate.',
        feedbackBody:
          'Looking closely at the address bar shows that the actual website is "auth-gateway-verify.example.net". "sso-northstar-cloud" at the front is just a prefix label created by the site owner.',
        whyItMattersDetail:
          'Anyone who registers a domain name can get a free HTTPS padlock in minutes. Always read the domain name right before the first single slash (/) to know who owns the page.',
        evidenceIdToRecord: 'ev-2-urlbar',
      },
      {
        stepNumber: 2,
        title: 'Check the sign-in request',
        instruction:
          'Now look at what the sign-in box is asking you to provide. Click the sign-in prompt fields on the page to inspect what it requests.',
        interactionPrompt: 'Click the sign-in request area inside the login card.',
        hintText: 'Click the highlighted box inside the Northstar Cloud Identity card where it asks for your password and 6-digit code.',
        feedbackHeadline:
          'An unexpected request for both your password and a one-time code is a serious warning sign.',
        feedbackBody:
          'Normal sign-in pages check your password first before asking for a second-step verification code. This page asks for both together on a single screen so an attacker can use them right away.',
        whyItMattersDetail:
          'When a fake login page collects your password and your 6-digit code at the same time, scammers can type both into the real website immediately to access your account.',
        evidenceIdToRecord: 'ev-2-form',
      },
      {
        stepNumber: 3,
        title: 'Decide what to do',
        instruction:
          'You have enough information to decide what to do. Choose how you want to respond to this sign-in page.',
        interactionPrompt: 'Choose your action below.',
        hintText: 'Since the domain belongs to an unknown third party, avoid entering any details on this page.',
        feedbackHeadline: 'Decision recorded.',
        feedbackBody: 'Let’s review the full breakdown of this sign-in trap.',
        whyItMattersDetail: '',
      },
    ],
    revealSummary: {
      suspiciousSignals: [
        'The real domain before the first slash (/) was "auth-gateway-verify.example.net", not Northstar’s official website.',
        'The HTTPS padlock was active, proving only that the connection was encrypted—not that the site was official.',
        'The form asked for both a password and a 6-digit authenticator code at the exact same time.',
      ],
      keyLessonTitle: 'Why HTTPS Is Not Proof of Legitimacy',
      keyLessonBody:
        'A padlock icon in the browser bar simply means no one can eavesdrop on the connection between you and the website you are visiting. If you are visiting a scammer’s website, your connection to the scammer is encrypted! Checking the actual domain name—and using a password manager that only auto-fills on matching domains—protects you from lookalike login screens.',
      practicalRule:
        'Always verify the domain name right before the first single slash (/), and never enter both your password and a one-time code on an unfamiliar link.',
    },
  },

  'sim-3': {
    id: 'sim-3',
    roomCode: 'Room 03 of 05',
    roomTitle: 'Your Delivery Is On Hold',
    durationLabel: '~3 mins',
    nextRoomTeaser:
      'Next up in Room 04: A printed office notice asks you to scan a QR code with your phone camera. Learn how to inspect QR codes safely.',
    briefing:
      'Your phone buzzes with a text message saying a parcel delivery failed and needs a $1.85 re-delivery confirmation before 5:00 PM. Let’s check whether this text is genuine.',
    tasks: [
      {
        stepNumber: 1,
        title: 'Inspect the sender & fee request',
        instruction:
          'First, look at who sent the text message and what they are asking for. Tap the sender phone number at the top of the phone screen (or the $1.85 fee text) to inspect it.',
        interactionPrompt: 'Tap the sender phone number "+1 (555) 017-8392" at the top of the phone screen.',
        hintText: 'Click the top header of the simulated phone screen showing "+1 (555) 017-8392".',
        feedbackHeadline: 'Good eye — an ordinary 10-digit number and a tiny fee are classic scam clues.',
        feedbackBody:
          'Major delivery companies rarely text payment links from random 10-digit cell numbers. And the tiny $1.85 fee is designed to feel harmless so you pull out your credit card without thinking twice.',
        whyItMattersDetail:
          'Scammers don’t want $1.85—they use a tiny fee as an excuse to make you type your full credit card number, security code, and billing address into their form.',
        evidenceIdToRecord: 'ev-3-number',
      },
      {
        stepNumber: 2,
        title: 'Preview the link inside the text',
        instruction:
          'Now inspect the web link inside the text message without opening it in a browser. Tap the link box inside the message bubble to reveal where it leads.',
        interactionPrompt: 'Tap the web link inside the SMS message bubble.',
        hintText: 'Click the pink link box reading "https://swiftpost-parcel-redelivery.example.org/..." inside the text message.',
        feedbackHeadline: 'Clue confirmed — the link uses a newly created lookalike web address.',
        feedbackBody:
          'Instead of the courier’s real website, the link points to "swiftpost-parcel-redelivery.example.org"—a hyphenated address set up specifically to imitate a tracking page.',
        whyItMattersDetail:
          'On mobile phones, browser address bars are narrow and often hide once you scroll, making fake delivery websites look very convincing once opened.',
        evidenceIdToRecord: 'ev-3-url',
      },
      {
        stepNumber: 3,
        title: 'Decide how to verify the claim',
        instruction:
          'You might genuinely be expecting a package this week. Choose the safest way to handle this text message.',
        interactionPrompt: 'Choose your response action below.',
        hintText: 'How can you check on a real package without using the link or phone number in the suspicious text?',
        feedbackHeadline: 'Decision recorded.',
        feedbackBody: 'Let’s review the takeaway from this mobile delivery scam.',
        whyItMattersDetail: '',
      },
    ],
    revealSummary: {
      suspiciousSignals: [
        'Sent from an unverified 10-digit mobile number rather than an official notification channel.',
        'Asked for a tiny $1.85 fee to trick you into typing full credit card details.',
        'Used a hyphenated lookalike website ("swiftpost-parcel-redelivery.example.org") with an urgent 5:00 PM cutoff.',
      ],
      keyLessonTitle: 'How Tiny-Fee Delivery Texts Steal Payment Cards',
      keyLessonBody:
        'Delivery text scams succeed because most people order items online regularly. By asking for just $1 to $2, scammers lower your guard so you focus on getting your package rather than questioning why a courier needs your credit card number.',
      practicalRule:
        'Never tap links in unexpected delivery or toll texts; open the retailer or courier’s official app independently to check your orders.',
    },
  },

  'sim-4': {
    id: 'sim-4',
    roomCode: 'Room 04 of 05',
    roomTitle: 'Scan Before You Trust',
    durationLabel: '~3 mins',
    nextRoomTeaser:
      'Next up in Room 05: An urgent workplace chat message from "IT Security" asks for the 6-digit verification code that just arrived on your phone.',
    briefing:
      'A printed notice on the conference room table—and a matching PDF in your inbox—asks staff to scan a QR code with their personal phone to keep their Wi-Fi working.',
    tasks: [
      {
        stepNumber: 1,
        title: 'Scan the demonstration QR code',
        instruction:
          'Unlike a normal text link, you cannot read a QR code with your eyes. Click "Scan QR Code with Camera Preview" to see the web address hidden inside the square.',
        interactionPrompt: 'Click "Scan QR Code with Camera Preview" on the camera panel.',
        hintText: 'Click the pink button inside the Mobile Camera Preview box on the right side of the poster.',
        feedbackHeadline: 'Destination revealed — the QR code hides an unfamiliar website address.',
        feedbackBody:
          'Your camera preview shows that the QR code leads to "device-enroll-auth.example.net", an external website that has nothing to do with your company.',
        whyItMattersDetail:
          'Anyone can generate a QR code for any website in seconds. Always read the small web address preview on your camera screen before tapping to open it.',
        evidenceIdToRecord: 'ev-4-qrdecode',
      },
      {
        stepNumber: 2,
        title: 'Inspect the notice instructions',
        instruction:
          'Look at the instructions on the printed notice. Click the highlighted sentence on the poster to see why it specifically tells you not to use your laptop.',
        interactionPrompt: 'Click the instruction text on the Wi-Fi notice poster.',
        hintText: 'Click the paragraph on the left poster that says "Do not use your laptop browser..."',
        feedbackHeadline: 'Important clue — the notice tries to move you off your protected work computer.',
        feedbackBody:
          'Work laptops usually have security tools that block known scam websites. By telling you to scan with your personal phone, the scammer bypasses those workplace protections.',
        whyItMattersDetail:
          'Genuine workplace IT updates always give you a standard internal helpdesk link or ticket number you can verify on your computer.',
        evidenceIdToRecord: 'ev-4-channelshift',
      },
      {
        stepNumber: 3,
        title: 'Decide whether to open or cancel',
        instruction:
          'Now that you see where the QR code points and why it asks for your phone, choose what to do next.',
        interactionPrompt: 'Choose your action below.',
        hintText: 'Should you open an unfamiliar login link on your phone, or report the notice to IT?',
        feedbackHeadline: 'Decision recorded.',
        feedbackBody: 'Let’s review how QR code deception works.',
        whyItMattersDetail: '',
      },
    ],
    revealSummary: {
      suspiciousSignals: [
        'The QR code hid a redirect to an external website ("device-enroll-auth.example.net").',
        'The instructions insisted you use your personal phone instead of your protected work laptop.',
        'The notice lacked any official IT ticket number or standard intranet web address.',
      ],
      keyLessonTitle: 'Why Scammers Hide Links Inside QR Codes',
      keyLessonBody:
        'QR codes are simply web links disguised as pixel patterns. Scammers place them inside PDF attachments and on physical signs (like parking meters or office tables) because automated email scanners often miss them and people tend to tap camera previews without checking the domain name.',
      practicalRule:
        'Treat every QR code like an unknown link: check the domain name in your camera preview first, and never sign in to work or bank accounts via an unexpected QR code.',
    },
  },

  'sim-5': {
    id: 'sim-5',
    roomCode: 'Room 05 of 05',
    roomTitle: 'The Urgent IT Request',
    durationLabel: '~3 mins',
    nextRoomTeaser:
      'You have completed all 5 learning rooms! Next, view your personal Recognition Report to see your progress and download your summary.',
    briefing:
      'A workplace chat message pops up from someone claiming to be on the IT Security team. They say someone is breaking into your account right now—and they need your help within 60 seconds.',
    tasks: [
      {
        stepNumber: 1,
        title: "Inspect the agent's identity and opening message",
        instruction:
          'The sender mentions your real manager’s name ("Elena Vance") and a ticket number to sound trustworthy. Click the sender’s account badge at the top of the chat window to inspect their profile.',
        interactionPrompt: 'Click the sender profile badge in the chat header.',
        hintText: 'Click the badge reading "External Guest Account · [ext-secops-dispatch...]" at the top of the chat window.',
        feedbackHeadline: 'Good catch — knowing your manager’s name does not prove they work in IT.',
        feedbackBody:
          'The profile badge shows this message came from an unverified external guest account. Scammers easily find manager names and job titles on public sites like LinkedIn to make their story believable.',
        whyItMattersDetail:
          'Using real names and job titles to sound official is called "pretexting". Never assume a caller or chat sender is genuine just because they know who you report to.',
        evidenceIdToRecord: 'ev-5-pretext',
      },
      {
        stepNumber: 2,
        title: 'Inspect the 6-digit code request',
        instruction:
          'At the exact same moment, a 6-digit verification code arrives on your phone, and the agent asks you to type it into the chat. Click the phone notification banner or the agent’s message to inspect what is really happening.',
        interactionPrompt: 'Click the yellow phone notification banner inside the chat window.',
        hintText: 'Click the yellow box showing "[Text Message on Your Phone] Northstar Login: Your one-time verification code..."',
        feedbackHeadline:
          'Critical discovery — the scammer is trying to sign in to your account right now.',
        feedbackBody:
          'Your phone received a real sign-in code because the scammer just typed your username on the real login screen. They are calling it a "security cancellation code" to trick you into handing over the key to your account.',
        whyItMattersDetail:
          'Real IT support staff, security teams, and banks never need your password or one-time verification code (OTP) to cancel a session or protect your account.',
        evidenceIdToRecord: 'ev-5-otpask',
      },
      {
        stepNumber: 3,
        title: 'Choose how to respond',
        instruction:
          'The agent is pressuring you to reply with the 6-digit code in the next 60 seconds. Choose how you will respond.',
        interactionPrompt: 'Select your response below.',
        hintText: 'Remember the golden rule about passwords and one-time verification codes.',
        feedbackHeadline: 'Decision recorded.',
        feedbackBody: 'Let’s review the key takeaway from this live chat scenario.',
        whyItMattersDetail: '',
      },
    ],
    revealSummary: {
      suspiciousSignals: [
        'The sender was an external guest account using public manager names ("Elena Vance") to sound like an insider.',
        'A real sign-in verification code arrived on your phone while they were chatting with you—meaning they were actively trying to log in as you.',
        'They asked you to share a 6-digit one-time verification code under a 60-second countdown.',
      ],
      keyLessonTitle: 'Why Legitimate Support Never Asks for Passwords or One-Time Codes',
      keyLessonBody:
        'One-time verification codes (OTPs) exist for one purpose: to prove that YOU are the person signing in or resetting your password. If an administrator needs to lock or protect your account, they can do so from their own system tools without ever asking for your password or phone code.',
      practicalRule:
        'Never share a password or one-time verification code (OTP) with anyone—no matter how urgent the story or who they claim to be.',
    },
  },
};

const INBOX_MESSAGES = [
  {
    id: 'msg-suspicious',
    isTask: true,
    senderName: 'Northstar Security Operations',
    senderEmail: 'security-noreply@northstar-id-verify.example.com',
    replyTo: 'support-ticket-882@external-mail-relay.example.net',
    mailedBy: 'mailer4.northstar-id-verify.example.com',
    subject: '[ACTION REQUIRED] Unverified Sign-In — Suspension in 2 Hours',
    time: '09:14 AM',
    snippet: 'Automated Security Notice: Complete identity validation within 120 minutes...',
  },
  {
    id: 'msg-safe-1',
    isTask: false,
    senderName: 'Elena Vance (Product Ops)',
    senderEmail: 'elena.vance@northstar.example.com',
    replyTo: 'elena.vance@northstar.example.com',
    mailedBy: 'mail.northstar.example.com',
    subject: 'Notes from Tuesday Sprint Planning',
    time: 'Yesterday',
    snippet: 'Thanks everyone for reviewing the Q4 milestones. No action needed.',
  },
  {
    id: 'msg-safe-2',
    isTask: false,
    senderName: 'Workplace Facilities',
    senderEmail: 'facilities@northstar.example.com',
    replyTo: 'facilities@northstar.example.com',
    mailedBy: 'mail.northstar.example.com',
    subject: '3rd Floor Coffee Machine Filter Replaced',
    time: 'Mon',
    snippet: 'Maintenance on the 3rd floor breakroom machine is complete.',
  },
];

export function SimulationPage({
  scenarioId,
  session,
  onInspectEvidence,
  onUpdateRoomTask,
  onDecisionRecorded,
  navigate,
}: SimulationPageProps) {
  const room = ROOM_DEFINITIONS[scenarioId] || ROOM_DEFINITIONS['sim-1'];
  const totalTasks = room.tasks.length;

  // Saved task step from session (0-indexed: 0..totalTasks-1, or totalTasks when in Final Reveal stage)
  const savedFeedback = session.simulationFeedbacks[scenarioId] || null;
  const initialStep = savedFeedback
    ? totalTasks
    : Math.min(session.roomTaskProgress?.[scenarioId] || 0, totalTasks - 1);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStep);
  const [taskCompletedInCurrentStep, setTaskCompletedInCurrentStep] = useState<boolean>(false);
  const [showWhyItMatters, setShowWhyItMatters] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [evidenceLogOpen, setEvidenceLogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedInboxId, setSelectedInboxId] = useState<string>('msg-safe-1');

  // Sync state when changing rooms
  useEffect(() => {
    const existingFb = session.simulationFeedbacks[scenarioId] || null;
    const savedStep = existingFb
      ? ROOM_DEFINITIONS[scenarioId]?.tasks.length || 3
      : Math.min(
          session.roomTaskProgress?.[scenarioId] || 0,
          (ROOM_DEFINITIONS[scenarioId]?.tasks.length || 3) - 1
        );
    setCurrentStepIndex(savedStep);
    setTaskCompletedInCurrentStep(false);
    setShowWhyItMatters(false);
    setShowHint(false);
    setEvidenceLogOpen(false);
    setIsSubmitting(false);
    // In Room 1, start on a normal email if on Task 1 so clicking the suspicious email is a real interaction
    setSelectedInboxId(savedStep > 0 ? 'msg-suspicious' : 'msg-safe-1');
  }, [scenarioId]);

  const isRevealStage = currentStepIndex >= totalTasks && Boolean(savedFeedback);
  const currentTask: RoomTaskDefinition =
    room.tasks[Math.min(currentStepIndex, totalTasks - 1)];

  const inspectedIds = session.inspectedEvidenceByScenario[scenarioId] || [];

  // Complete the current investigation task and show immediate short feedback
  const handleCompleteInvestigationTask = (evidenceId?: string) => {
    if (evidenceId) {
      onInspectEvidence(scenarioId, evidenceId);
    }
    setTaskCompletedInCurrentStep(true);
  };

  // Advance to the next task in the room and persist in localStorage
  const handleAdvanceToNextTask = () => {
    const nextIdx = currentStepIndex + 1;
    setCurrentStepIndex(nextIdx);
    setTaskCompletedInCurrentStep(false);
    setShowWhyItMatters(false);
    setShowHint(false);
    onUpdateRoomTask(scenarioId, nextIdx);
  };

  // Submit the visitor's decision in the final task -> move to Reveal & Takeaway stage
  const handleDecisionSubmit = (actionId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fb = evaluateSimulationDecisionSync({
        scenarioId,
        actionId,
        inspectedEvidenceIds: session.inspectedEvidenceByScenario[scenarioId] || [],
      });
      onDecisionRecorded(fb);
      onUpdateRoomTask(scenarioId, totalTasks);
      setCurrentStepIndex(totalTasks);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset room to Task 1 if the user wants to replay the mission from the start
  const handleReplayRoom = () => {
    setCurrentStepIndex(0);
    setTaskCompletedInCurrentStep(false);
    setShowWhyItMatters(false);
    setShowHint(false);
    setSelectedInboxId('msg-safe-1');
    onUpdateRoomTask(scenarioId, 0);
  };

  const simOrder = ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'];
  const roomIndex = simOrder.indexOf(scenarioId);
  const nextRoomId =
    roomIndex >= 0 && roomIndex < simOrder.length - 1 ? simOrder[roomIndex + 1] : null;

  // Actions for the Decision task of each room
  const getRoomDecisionOptions = () => {
    if (scenarioId === 'sim-1') {
      return [
        {
          id: 'act-report-phish',
          label: 'Report Phishing & Delete Email',
          desc: 'Flag the message to the security team without clicking the link.',
          primary: true,
        },
        {
          id: 'act-verify-independent',
          label: 'Ignore Email & Check Account via Your Own Bookmark',
          desc: 'Close the email and open your normal workspace bookmark separately.',
          primary: false,
        },
        {
          id: 'act-reply-sender',
          label: 'Reply Asking Sender to Confirm',
          desc: 'Send a reply message to ask why your account was flagged.',
          primary: false,
        },
        {
          id: 'act-click-link',
          label: 'Click "Keep My Account Active" Link (Simulated)',
          desc: 'Follow the link inside the email to resolve the suspension warning.',
          primary: false,
        },
      ];
    }
    if (scenarioId === 'sim-2') {
      return [
        {
          id: 'act-close-report',
          label: 'Close the Tab and Report the Link',
          desc: 'Leave this suspicious sign-in page right away and report the link.',
          primary: true,
        },
        {
          id: 'act-navigate-direct',
          label: 'Use a Saved Bookmark or Official Website Instead',
          desc: 'Close this tab and open your known workspace bookmark directly.',
          primary: false,
        },
        {
          id: 'act-submit-login',
          label: 'Continue with the Suspicious Sign-In (Simulated)',
          desc: 'Proceed with signing in on this page to view the urgent document.',
          primary: false,
        },
      ];
    }
    if (scenarioId === 'sim-3') {
      return [
        {
          id: 'act-check-carrier-app',
          label: 'Report Junk & Check Official Delivery App Directly',
          desc: 'Do not tap the link; check your real orders in the official courier app.',
          primary: true,
        },
        {
          id: 'act-delete-ignore',
          label: 'Delete the Text Message Without Tapping',
          desc: 'Dismiss and delete the message from your phone.',
          primary: false,
        },
        {
          id: 'act-tap-sms-link',
          label: 'Open the Link to Pay the $1.85 Fee (Simulated)',
          desc: 'Follow the text link to confirm your street address and pay the fee.',
          primary: false,
        },
      ];
    }
    if (scenarioId === 'sim-4') {
      return [
        {
          id: 'act-report-remove',
          label: 'Cancel Scan and Report the Notice to IT',
          desc: 'Do not open the link, and alert IT about the suspicious QR poster.',
          primary: true,
        },
        {
          id: 'act-check-intranet',
          label: 'Cancel and Check the Official IT Page on Your Laptop',
          desc: 'Put your phone away and check the official IT status page on your computer.',
          primary: false,
        },
        {
          id: 'act-scan-open-url',
          label: 'Open the QR Link on Your Phone (Simulated)',
          desc: 'Proceed to the website shown in the camera preview.',
          primary: false,
        },
      ];
    }
    return [
      {
        id: 'act-refuse-verify-independent',
        label: 'Refuse, End Chat, and Contact IT Through Official Directory',
        desc: 'Never share the 6-digit code; close the chat and verify via an official channel.',
        primary: true,
      },
      {
        id: 'act-refuse-close',
        label: 'Refuse to Share the Code and Close the Chat',
        desc: 'Decline the request and close the chat window immediately.',
        primary: false,
      },
      {
        id: 'act-share-otp',
        label: 'Send the 6-Digit Code in the Chat (Simulated)',
        desc: 'Share the code with the agent so they can cancel the alleged breach.',
        primary: false,
      },
    ];
  };

  // Determine which clues have been unlocked so far in the current room
  const isStepReached = (stepNum: number) =>
    isRevealStage ||
    currentStepIndex > stepNum - 1 ||
    (currentStepIndex === stepNum - 1 && taskCompletedInCurrentStep);

  return (
    <div className="flex-1 max-w-[1340px] w-full mx-auto px-6 py-8 space-y-8">
      {/* =======================================================================
          1. ROOM BRIEFING & PROGRESS HEADER
         ======================================================================= */}
      <section className="bg-white border border-[#F0E7ED] rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F0E7ED] pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-bold text-[#D94F89] uppercase tracking-wider">
                {room.roomCode}
              </span>
              <span className="text-[#716B76]">·</span>
              <span className="inline-flex items-center gap-1 text-[#716B76]">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated time: {room.durationLabel}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#24212A]">
              {room.roomTitle}
            </h1>
          </div>

          {/* Room Task Progress Pill & Collapsible Evidence Log Toggle */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] text-xs font-semibold text-[#D94F89]">
              {isRevealStage
                ? `Room Completed (${totalTasks} of ${totalTasks} Tasks Done)`
                : `Current Progress: Task ${currentTask.stepNumber} of ${totalTasks}`}
            </div>

            <button
              type="button"
              onClick={() => setEvidenceLogOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] hover:border-[#E879A8] text-xs font-semibold text-[#24212A] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#D94F89]" />
              <span>Evidence Log ({inspectedIds.length})</span>
              {evidenceLogOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Short Situation Premise */}
        <p className="text-sm sm:text-base text-[#24212A] leading-relaxed max-w-4xl">
          {room.briefing}
        </p>

        {/* Horizontal Room Task Stepper (Shows completed, current, and brief future task titles without spoiling answers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {room.tasks.map((t, idx) => {
            const isDone = isRevealStage || idx < currentStepIndex || (idx === currentStepIndex && taskCompletedInCurrentStep);
            const isCurrent = !isRevealStage && idx === currentStepIndex;
            const isUnlocked = isRevealStage || idx <= currentStepIndex;
            return (
              <button
                key={t.stepNumber}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    setCurrentStepIndex(idx);
                    setTaskCompletedInCurrentStep(idx < currentStepIndex);
                  }
                }}
                className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-[#FFF1F6] border-[#D94F89] shadow-2xs cursor-pointer'
                    : isDone
                    ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 cursor-pointer'
                    : 'bg-[#FCFAFC] border-[#F0E7ED] opacity-65 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#D94F89] text-white'
                      : 'bg-[#F0E7ED] text-[#716B76]'
                  }`}
                >
                  {isDone ? '✓' : t.stepNumber}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-mono text-[#716B76]">
                    Task {t.stepNumber}
                  </div>
                  <div className="text-xs font-bold text-[#24212A] truncate">
                    {t.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Collapsible Evidence Log Drawer (Collapsed by default) */}
        <AnimatePresence>
          {evidenceLogOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-4 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] space-y-2 text-xs">
                <div className="font-bold text-[#24212A]">
                  Clues Discovered So Far in {room.roomTitle}:
                </div>
                {inspectedIds.length === 0 ? (
                  <p className="text-[#716B76]">
                    No clues recorded yet. Complete Task 1 below to log your first discovery.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-[#24212A]">
                    {room.tasks
                      .filter(
                        (t) =>
                          t.evidenceIdToRecord &&
                          inspectedIds.includes(t.evidenceIdToRecord)
                      )
                      .map((t) => (
                        <li key={t.stepNumber} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>{t.title}:</strong> {t.feedbackHeadline}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* =======================================================================
          2. MAIN ROOM WORKSPACE: LEFT (ACTIVE TASK PANEL) | RIGHT (SIMULATED INTERFACE)
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT 5 COLUMNS: Focused Single-Task Instruction & Progressive Feedback */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          {!isRevealStage ? (
            <motion.div
              key={`task-panel-${currentTask.stepNumber}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white border-2 border-[#E879A8] rounded-2xl p-6 shadow-sm space-y-5"
            >
              {/* Current Task Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D94F89]">
                    Task {currentTask.stepNumber} of {totalTasks}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#716B76] hover:text-[#D94F89] cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                  </button>
                </div>

                <h2 className="text-xl font-bold text-[#24212A]">
                  {currentTask.title}
                </h2>
                <p className="text-sm text-[#24212A] leading-relaxed">
                  {currentTask.instruction}
                </p>
              </div>

              {/* Optional Nudge Hint */}
              {showHint && (
                <div className="p-3.5 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] text-xs text-[#24212A]">
                  <strong className="text-[#D94F89]">Where to look: </strong>
                  {currentTask.hintText}
                </div>
              )}

              {/* IF THIS IS AN INVESTIGATION TASK (Tasks 1 .. N-1) */}
              {currentStepIndex < totalTasks - 1 ? (
                <div className="space-y-4 pt-1">
                  {!taskCompletedInCurrentStep ? (
                    <div className="p-4 rounded-xl bg-[#FCFAFC] border border-dashed border-[#E879A8] flex items-center gap-3 text-xs text-[#24212A]">
                      <Search className="w-4 h-4 text-[#D94F89] shrink-0" />
                      <span className="font-medium">
                        {currentTask.interactionPrompt}
                      </span>
                    </div>
                  ) : (
                    /* Short Contextual Feedback after the user performs the interaction */
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-950 text-sm">
                            {currentTask.feedbackHeadline}
                          </div>
                          <p className="text-emerald-900 leading-relaxed">
                            {currentTask.feedbackBody}
                          </p>
                        </div>
                      </div>

                      {/* Progressive Level 2 Explanation: Expandable "Why does this matter?" */}
                      {currentTask.whyItMattersDetail && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowWhyItMatters((prev) => !prev)}
                            className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline cursor-pointer"
                          >
                            <span>
                              {showWhyItMatters
                                ? 'Hide deeper explanation'
                                : 'Why does this matter?'}
                            </span>
                            {showWhyItMatters ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {showWhyItMatters && (
                            <p className="mt-2 p-3 rounded-lg bg-white/90 border border-emerald-200 text-[#24212A] leading-relaxed">
                              {currentTask.whyItMattersDetail}
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAdvanceToNextTask}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <span>Continue to Task {currentTask.stepNumber + 1}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* IF THIS IS THE FINAL DECISION TASK IN THE ROOM */
                <div className="space-y-3 pt-2 border-t border-[#F0E7ED]">
                  <div className="text-xs font-bold text-[#24212A]">
                    Choose your action:
                  </div>
                  {getRoomDecisionOptions().map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecisionSubmit(opt.id)}
                      className="w-full text-left p-4 rounded-xl border bg-[#FCFAFC] border-[#F0E7ED] hover:bg-[#FFF1F6]/60 hover:border-[#D94F89] transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="text-xs font-bold text-[#24212A] group-hover:text-[#D94F89] flex items-center justify-between transition-colors">
                        <span>{opt.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#716B76] group-hover:text-[#D94F89] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-xs text-[#716B76] leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* WHEN IN REVEAL STAGE: Compact Decision Summary Card on Left */
            savedFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#E879A8] rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#D94F89] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Room Mission Complete</span>
                </div>

                <h2 className="text-xl font-bold text-[#24212A]">
                  {savedFeedback.resultHeadline}
                </h2>

                <p className="text-sm text-[#716B76] leading-relaxed">
                  {savedFeedback.actionExplanation}
                </p>

                <div className="p-4 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] space-y-1 text-xs">
                  <div className="font-bold text-[#D94F89]">
                    Practical Rule to Remember:
                  </div>
                  <p className="text-[#24212A] font-medium leading-relaxed">
                    {room.revealSummary.practicalRule}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {nextRoomId ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/experience/simulation/${nextRoomId}`)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-sm font-semibold cursor-pointer shadow-xs"
                    >
                      <span>Continue to Next Room ({roomIndex + 2} of 5)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/report')}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-sm font-semibold cursor-pointer shadow-xs"
                    >
                      <span>All 5 Rooms Complete — View My Report</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleReplayRoom}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#716B76] hover:text-[#24212A] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay This Room Step by Step</span>
                  </button>
                </div>
              </motion.div>
            )
          )}
        </div>

        {/* RIGHT 7 COLUMNS: Interactive Interface Mockup (Reveals details progressively as tasks advance) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ===================================================================
              ROOM 01: EMAIL INBOX MOCKUP
             =================================================================== */}
          {scenarioId === 'sim-1' && (
            <div className="bg-white border border-[#F0E7ED] rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-[#FCFAFC] border-b border-[#F0E7ED] px-5 py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-[#24212A]">
                  <Mail className="w-4 h-4 text-[#D94F89]" />
                  <span>Northstar Workspace Mail</span>
                </div>
                <span className="text-[#716B76]">Interactive Mail Environment</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#F0E7ED]">
                {/* Left Inbox List */}
                <div className="md:col-span-4 bg-[#FCFAFC]/60 p-3 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#716B76] px-1">
                    Inbox (3)
                  </div>
                  {INBOX_MESSAGES.map((m) => {
                    const isSelected = selectedInboxId === m.id;
                    const highlightForTask1 =
                      currentStepIndex === 0 && !taskCompletedInCurrentStep && m.isTask;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedInboxId(m.id);
                          if (m.isTask && currentStepIndex === 0) {
                            handleCompleteInvestigationTask('ev-1-urgency');
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                          isSelected
                            ? 'bg-white border-[#D94F89] shadow-2xs'
                            : highlightForTask1
                            ? 'bg-[#FFF1F6] border-[#E879A8] hover:border-[#D94F89]'
                            : 'bg-white/60 border-transparent hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#24212A] truncate">
                            {m.senderName}
                          </span>
                          <span className="text-[10px] font-mono text-[#716B76] shrink-0">
                            {m.time}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-[#24212A] line-clamp-1">
                          {m.subject}
                        </div>
                        {m.isTask && (
                          <div className="text-[11px] font-semibold text-[#D94F89] pt-0.5">
                            ● Flagged Security Alert
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Email Reading Pane */}
                <div className="md:col-span-8 p-6 space-y-5">
                  {selectedInboxId !== 'msg-suspicious' ? (
                    <div className="py-12 text-center space-y-2">
                      <p className="text-sm font-semibold text-[#24212A]">
                        Routine Colleague Email Selected
                      </p>
                      <p className="text-xs text-[#716B76] max-w-sm mx-auto leading-relaxed">
                        This message is a normal internal note. For Task 1, click the flagged alert from <strong>Northstar Security Operations</strong> at the top of the inbox list on the left.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="border-b border-[#F0E7ED] pb-4 space-y-3">
                        <h3 className="text-base font-bold text-[#24212A] leading-snug">
                          [ACTION REQUIRED] Unverified Sign-In — Suspension in 2 Hours
                        </h3>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs">
                            <div className="font-bold text-[#24212A]">
                              Northstar Security Operations
                            </div>
                            <div className="text-[#716B76]">
                              To: alex.rivera@northstar.example.com
                            </div>
                          </div>

                          {/* Task 2 Control: Inspect Sender Details */}
                          {currentStepIndex >= 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleCompleteInvestigationTask('ev-1-sender');
                                onInspectEvidence('sim-1', 'ev-1-replyto');
                              }}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isStepReached(2)
                                  ? 'bg-[#FFF1F6] border-[#D94F89] text-[#D94F89]'
                                  : 'bg-[#D94F89] text-white border-[#D94F89] shadow-xs'
                              }`}
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>
                                {isStepReached(2)
                                  ? 'Sender Details Inspected ✓'
                                  : 'Inspect Sender Details'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Progressive Reveal: Only show header details after Task 2 interaction */}
                        {isStepReached(2) && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] font-mono text-xs space-y-1 text-[#24212A]"
                          >
                            <div>
                              <span className="text-[#716B76]">Actual From Address:</span>{' '}
                              <span className="font-bold text-[#D94F89]">
                                security-noreply@northstar-id-verify.example.com
                              </span>
                            </div>
                            <div>
                              <span className="text-[#716B76]">Reply-To Address:</span>{' '}
                              <span className="font-bold text-amber-800">
                                support-ticket-882@external-mail-relay.example.net
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Email Body */}
                      <div className="space-y-3 text-sm text-[#24212A] leading-relaxed">
                        <p>
                          Our protection system detected an unrecognized sign-in attempt on your Northstar Workspace profile.
                        </p>
                        <p
                          className={`p-3.5 rounded-xl border transition-colors ${
                            isStepReached(1)
                              ? 'bg-[#FFF1F6]/60 border-[#FCE4EE]'
                              : 'bg-[#FCFAFC] border-[#F0E7ED]'
                          }`}
                        >
                          Failure to complete identity validation within{' '}
                          <strong>120 minutes</strong> will trigger automatic account lock and permanent revocation of shared drive access.
                        </p>
                      </div>

                      {/* Task 3 Control: Preview Link Destination */}
                      <div className="pt-2 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#24212A] text-white text-xs font-semibold select-none">
                            <span>Keep My Account Active →</span>
                          </span>

                          {currentStepIndex >= 2 && (
                            <button
                              type="button"
                              onClick={() => handleCompleteInvestigationTask('ev-1-link')}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isStepReached(3)
                                  ? 'bg-[#FFF1F6] border-[#D94F89] text-[#D94F89]'
                                  : 'bg-[#D94F89] text-white border-[#D94F89] shadow-xs'
                              }`}
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>
                                {isStepReached(3)
                                  ? 'Link Destination Previewed ✓'
                                  : 'Preview Link Address'}
                              </span>
                            </button>
                          )}
                        </div>

                        {isStepReached(3) && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 rounded-xl bg-[#24212A] text-white font-mono text-xs space-y-1"
                          >
                            <div className="text-[#FCE4EE] font-sans text-[11px]">
                              Link Preview (Look right before the first single slash /):
                            </div>
                            <div className="break-all">
                              https://northstar.example.com.
                              <span className="text-amber-300 font-bold underline">
                                session-check-auth.example.net
                              </span>
                              /auth/verify
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              ROOM 02: BROWSER LOGIN MOCKUP ("The Suspicious Sign-In")
             =================================================================== */}
          {scenarioId === 'sim-2' && (
            <div className="bg-white border border-[#F0E7ED] rounded-2xl shadow-sm overflow-hidden">
              {/* Browser Window Top Bar */}
              <div className="bg-[#24212A] text-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-slate-300 ml-2">
                      Shared Document — Sign In Required
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Task 1: Click the Address Bar Below
                  </span>
                </div>

                {/* Clickable Address Bar (Neutral until inspected in Task 1!) */}
                <button
                  type="button"
                  onClick={() => {
                    handleCompleteInvestigationTask('ev-2-urlbar');
                    onInspectEvidence('sim-2', 'ev-2-cert');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    currentStepIndex === 0 && !taskCompletedInCurrentStep
                      ? 'border-[#E879A8] ring-2 ring-[#D94F89]/40'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 font-mono text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-400 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      <span>https://</span>
                    </span>
                    {!isStepReached(1) ? (
                      <span className="text-slate-200 truncate">
                        sso-northstar-cloud.auth-gateway-verify.example.net/login?redirect=roadmap_q4
                      </span>
                    ) : (
                      <span className="text-slate-300 truncate">
                        sso-northstar-cloud.
                        <span className="bg-amber-400/20 text-amber-300 font-bold px-1 rounded underline">
                          auth-gateway-verify.example.net
                        </span>
                        /login?redirect=roadmap_q4
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-sans font-semibold text-[#E879A8] shrink-0">
                    {isStepReached(1) ? 'Inspected ✓' : 'Click to Inspect Address'}
                  </span>
                </button>

                {/* Progressive Reveal: Address Breakdown only shown AFTER Task 1 click */}
                {isStepReached(1) && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 space-y-1"
                  >
                    <div className="font-semibold text-amber-300">
                      Address Inspection Result:
                    </div>
                    <p className="leading-relaxed">
                      • <strong>Actual Website Domain:</strong>{' '}
                      <code className="font-mono text-amber-300">
                        auth-gateway-verify.example.net
                      </code>{' '}
                      (right before the first <code className="font-mono">/</code>).
                      <br />• <strong>HTTPS Status:</strong> Connection is encrypted, which only means traffic to this unfamiliar website is private—not that Northstar owns it.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Simulated Sign-In Page Body */}
              <div className="p-8 bg-[#FCFAFC]">
                <div className="max-w-md mx-auto bg-white border border-[#F0E7ED] rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="text-center space-y-1">
                    <div className="text-xs font-bold tracking-wider text-[#716B76]">
                      NORTHSTAR WORKSPACE
                    </div>
                    <h3 className="text-lg font-bold text-[#24212A]">
                      Sign in to open “Q4_Product_Roadmap.pdf”
                    </h3>
                    <p className="text-xs text-[#716B76]">
                      Account: alex.rivera@northstar.example.com
                    </p>
                  </div>

                  {/* Task 2 Target: Inspect the Sign-In Request */}
                  <div
                    onClick={() => {
                      if (currentStepIndex >= 1) {
                        handleCompleteInvestigationTask('ev-2-form');
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      currentStepIndex === 1 && !taskCompletedInCurrentStep
                        ? 'bg-[#FFF1F6] border-[#D94F89] ring-2 ring-[#D94F89]/25 cursor-pointer'
                        : currentStepIndex >= 1
                        ? 'bg-[#FCFAFC] border-[#E879A8] cursor-pointer'
                        : 'bg-[#FCFAFC] border-[#F0E7ED]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[#24212A]">
                        1. Workspace Password
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-white border border-[#F0E7ED] text-xs font-mono text-[#716B76]">
                        •••••••••••••••• (Simulated Field)
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[#24212A]">
                        2. 6-Digit Authenticator Code (Requested on Same Screen)
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-white border border-[#F0E7ED] text-xs font-mono text-[#716B76]">
                        [ Enter 6-digit code from your phone app ]
                      </div>
                    </div>

                    {currentStepIndex >= 1 && (
                      <div className="pt-1 flex items-center justify-between text-xs font-semibold text-[#D94F89]">
                        <span>
                          {isStepReached(2)
                            ? 'Sign-In Request Inspected ✓'
                            : 'Click Here to Inspect This Sign-In Request'}
                        </span>
                        <Search className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {isStepReached(2) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 rounded-lg bg-[#FFF1F6] border border-[#FCE4EE] text-xs text-[#24212A] leading-relaxed"
                      >
                        <strong className="text-[#D94F89]">Warning Sign:</strong> This page asks for your password AND a 6-digit one-time code at the same time. Legitimate sign-in screens verify your password first before asking for a second-step code.
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              ROOM 03: MOBILE SMS MOCKUP ("Your Delivery Is On Hold")
             =================================================================== */}
          {scenarioId === 'sim-3' && (
            <div className="bg-white border border-[#F0E7ED] rounded-2xl shadow-sm p-6">
              <div className="max-w-md mx-auto border border-[#F0E7ED] rounded-2xl overflow-hidden bg-[#FCFAFC] shadow-xs">
                {/* Task 1 Target: Phone Sender Header */}
                <button
                  type="button"
                  onClick={() => {
                    handleCompleteInvestigationTask('ev-3-number');
                    onInspectEvidence('sim-3', 'ev-3-fee');
                  }}
                  className={`w-full text-left bg-white border-b px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer ${
                    currentStepIndex === 0 && !taskCompletedInCurrentStep
                      ? 'border-[#D94F89] bg-[#FFF1F6]/60'
                      : 'border-[#F0E7ED]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#D94F89]" />
                    <div>
                      <div className="text-xs font-bold font-mono text-[#24212A]">
                        +1 (555) 017-8392
                      </div>
                      <div className="text-[11px] text-[#716B76]">
                        Unknown Sender · Not in Contacts
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#D94F89]">
                    {isStepReached(1) ? 'Sender Inspected ✓' : 'Tap to Inspect Sender'}
                  </span>
                </button>

                {isStepReached(1) && (
                  <div className="px-4 py-2.5 bg-[#FFF1F6] border-b border-[#FCE4EE] text-xs text-[#24212A]">
                    <strong className="text-[#D94F89]">Clue #1:</strong> Sent from an ordinary 10-digit phone number, asking for a tiny <strong>$1.85 fee</strong> to get your credit card details.
                  </div>
                )}

                {/* SMS Bubble */}
                <div className="p-5 space-y-4">
                  <div className="bg-white border border-[#F0E7ED] rounded-2xl rounded-tl-xs p-4 space-y-3 text-sm text-[#24212A] leading-relaxed shadow-2xs">
                    <p>
                      <strong>SwiftPost Express:</strong> Delivery attempt #2 failed for parcel SP-904182 due to an unreadable street label.
                    </p>
                    <p>
                      Confirm your delivery address and pay the <strong>$1.85 re-dispatch fee</strong> before 5:00 PM today or your parcel returns to the warehouse:
                    </p>

                    {/* Task 2 Target: Link Inside SMS */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStepIndex >= 1) {
                          handleCompleteInvestigationTask('ev-3-url');
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border font-mono text-xs transition-all cursor-pointer break-all ${
                        currentStepIndex === 1 && !taskCompletedInCurrentStep
                          ? 'bg-[#FFF1F6] border-[#D94F89] text-[#D94F89] ring-2 ring-[#D94F89]/25'
                          : 'bg-[#FCFAFC] border-[#F0E7ED] text-[#D94F89]'
                      }`}
                    >
                      https://swiftpost-parcel-redelivery.example.org/claim-id-492
                    </button>
                  </div>

                  {isStepReached(2) && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-[#24212A] text-white text-xs space-y-1"
                    >
                      <div className="text-amber-300 font-semibold">
                        Link Preview Inspection:
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        The link points to <code className="font-mono text-amber-300">swiftpost-parcel-redelivery.example.org</code>—a hyphenated lookalike domain rather than the official courier website.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              ROOM 04: QR CODE SCANNER MOCKUP ("Scan Before You Trust")
             =================================================================== */}
          {scenarioId === 'sim-4' && (
            <div className="bg-white border border-[#F0E7ED] rounded-2xl shadow-sm p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left Poster */}
                <div className="md:col-span-6 bg-[#FCFAFC] border border-[#F0E7ED] rounded-2xl p-5 text-center space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#D94F89]">
                    Conference Room Notice
                  </div>
                  <h3 className="text-base font-bold text-[#24212A]">
                    Mandatory Staff Wi-Fi Certificate Renewal
                  </h3>

                  {/* Safe SVG QR Matrix */}
                  <div className="inline-block p-3 bg-white border-2 border-[#24212A] rounded-xl">
                    <svg
                      viewBox="0 0 120 120"
                      className="w-28 h-28"
                      role="img"
                      aria-label="Demonstration QR Code"
                    >
                      <rect width="120" height="120" fill="#ffffff" />
                      <rect x="10" y="10" width="30" height="30" fill="none" stroke="#24212A" strokeWidth="6" />
                      <rect x="19" y="19" width="12" height="12" fill="#24212A" />
                      <rect x="80" y="10" width="30" height="30" fill="none" stroke="#24212A" strokeWidth="6" />
                      <rect x="89" y="19" width="12" height="12" fill="#24212A" />
                      <rect x="10" y="80" width="30" height="30" fill="none" stroke="#24212A" strokeWidth="6" />
                      <rect x="19" y="89" width="12" height="12" fill="#24212A" />
                      <rect x="48" y="48" width="20" height="20" fill="#D94F89" />
                      <rect x="52" y="16" width="10" height="14" fill="#24212A" />
                      <rect x="76" y="54" width="22" height="10" fill="#24212A" />
                      <rect x="50" y="82" width="32" height="12" fill="#24212A" />
                    </svg>
                  </div>

                  {/* Task 2 Target: Notice Instructions */}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStepIndex >= 1) {
                        handleCompleteInvestigationTask('ev-4-channelshift');
                        onInspectEvidence('sim-4', 'ev-4-physical');
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      currentStepIndex === 1 && !taskCompletedInCurrentStep
                        ? 'bg-[#FFF1F6] border-[#D94F89] ring-2 ring-[#D94F89]/25'
                        : 'bg-white border-[#F0E7ED]'
                    }`}
                  >
                    <p className="text-[#24212A] leading-relaxed">
                      “Do not use your laptop browser. Scan exclusively with your personal smartphone camera and sign in with your corporate password.”
                    </p>
                    {currentStepIndex >= 1 && (
                      <div className="text-[#D94F89] font-semibold mt-1.5">
                        {isStepReached(2)
                          ? 'Notice Instruction Inspected ✓'
                          : 'Click to Inspect This Instruction'}
                      </div>
                    )}
                  </button>
                </div>

                {/* Right Camera Viewfinder (Task 1 Target) */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-5 rounded-2xl bg-[#24212A] text-white space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold flex items-center gap-1.5 text-[#FCE4EE]">
                        <Camera className="w-4 h-4 text-[#E879A8]" />
                        <span>Mobile Camera Preview</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">Safe Sandbox</span>
                    </div>

                    {!isStepReached(1) ? (
                      <div className="space-y-3 py-2">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Point your simulated phone camera at the QR code to preview the web address hidden inside it.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCompleteInvestigationTask('ev-4-qrdecode')}
                          className="w-full py-3 px-4 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-xs font-semibold cursor-pointer shadow-sm"
                        >
                          Scan QR Code with Camera Preview
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-2.5 text-xs"
                      >
                        <div className="text-amber-300 font-semibold">
                          Camera Decoded Destination Preview:
                        </div>
                        <div className="p-3 rounded-xl bg-black/50 border border-slate-700 font-mono text-[11px] text-amber-300 break-all">
                          https://wifi-cert-portal.device-enroll-auth.example.net/corporate-sso/login
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          The QR code leads to an unfamiliar domain (<code className="font-mono text-amber-300">device-enroll-auth.example.net</code>).
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {isStepReached(2) && (
                    <div className="p-3.5 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] text-xs text-[#24212A] leading-relaxed">
                      <strong className="text-[#D94F89]">Why it bans laptops:</strong> Telling you to use your personal phone moves you away from your work computer’s built-in security filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              ROOM 05: SUPPORT CHAT MOCKUP ("The Urgent IT Request")
             =================================================================== */}
          {scenarioId === 'sim-5' && (
            <div className="bg-white border border-[#F0E7ED] rounded-2xl shadow-sm overflow-hidden">
              {/* Task 1 Target: Chat Header & External Sender Profile */}
              <div className="bg-[#FCFAFC] border-b border-[#F0E7ED] px-5 py-4 flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#24212A] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#D94F89]" />
                    <span>Marcus Chen · IT Security Desk</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteInvestigationTask('ev-5-pretext')}
                    className={`text-left px-3 py-1 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                      currentStepIndex === 0 && !taskCompletedInCurrentStep
                        ? 'bg-[#FFF1F6] border-[#D94F89] text-[#D94F89] font-semibold'
                        : 'bg-white border-[#F0E7ED] text-[#D94F89]'
                    }`}
                  >
                    External Guest Account · [ext-secops@partner-bridge.example.net] —{' '}
                    {isStepReached(1) ? 'Profile Inspected ✓' : 'Click to Inspect Profile'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl rounded-tl-xs bg-[#FCFAFC] border border-[#F0E7ED] text-sm text-[#24212A] space-y-1">
                  <div className="text-xs font-semibold text-[#716B76]">
                    Marcus Chen · 4:51 PM
                  </div>
                  <p className="leading-relaxed">
                    Hi Alex — contacting you urgently from IT Security per <strong>Elena Vance’s Product Ops team list</strong> (Ticket #INC-9921). We see an unauthorized login trying to copy files from your workspace.
                  </p>
                </div>

                {/* Task 2 Target: Simultaneous Phone OTP Notification & Agent Demand */}
                {currentStepIndex >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleCompleteInvestigationTask('ev-5-otpask');
                        onInspectEvidence('sim-5', 'ev-5-otptrigger');
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        currentStepIndex === 1 && !taskCompletedInCurrentStep
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-900">
                        <span>🔔 TEXT MESSAGE ARRIVED ON YOUR PHONE (4:52 PM)</span>
                        <span className="underline">
                          {isStepReached(2) ? 'Inspected ✓' : 'Click to Inspect Code Alert'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-amber-950 leading-relaxed">
                        Northstar Login: Your one-time verification code is [REDACTED]. Never share this code with anyone, including support.
                      </p>
                    </button>

                    <div className="p-4 rounded-2xl rounded-tl-xs bg-[#FFF1F6] border border-[#FCE4EE] text-sm text-[#24212A] space-y-1">
                      <div className="text-xs font-semibold text-[#D94F89]">
                        Marcus Chen · 4:52 PM
                      </div>
                      <p className="leading-relaxed">
                        I just sent a 6-digit security cancellation code to your phone. <strong>Type that 6-digit code here in the next 60 seconds</strong> so I can block the intruder!
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          3. END-OF-ROOM REVEAL & TAKEAWAY SECTION (Only shown AFTER final decision!)
          Spaced cleanly for natural page scrolling without cramming.
         ======================================================================= */}
      {isRevealStage && savedFeedback && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[#F0E7ED] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="border-b border-[#F0E7ED] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D94F89]">
                Room Debrief &amp; Takeaway
              </div>
              <h2 className="text-2xl font-bold text-[#24212A] mt-0.5">
                {room.revealSummary.keyLessonTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/learn/${savedFeedback.relatedModuleSlug}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFF1F6] hover:bg-[#FCE4EE] text-xs font-semibold text-[#D94F89] cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Optional Deep Dive: {savedFeedback.attackTypeLabel}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Warning Signs Found */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-sm font-bold text-[#24212A]">
                What Made This Scenario Suspicious
              </h3>
              <ul className="space-y-2.5 text-sm text-[#24212A]">
                {room.revealSummary.suspiciousSignals.map((sig, i) => (
                  <li
                    key={i}
                    className="p-3.5 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] flex items-start gap-3 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#FFF1F6] text-[#D94F89] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How It Works & Safest Action */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] space-y-2">
                <h3 className="text-sm font-bold text-[#24212A]">
                  How Attackers Use This Trick
                </h3>
                <p className="text-sm text-[#716B76] leading-relaxed">
                  {room.revealSummary.keyLessonBody}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Safest Response
                </div>
                <div className="text-sm font-bold text-emerald-950">
                  {savedFeedback.safestActionLabel}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {savedFeedback.safestActionRationale}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF1F6] border border-[#FCE4EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#24212A] leading-relaxed">
                  {room.nextRoomTeaser}
                </p>
                {nextRoomId ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/experience/simulation/${nextRoomId}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    <span>Next Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/report')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    <span>View My Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
