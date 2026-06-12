import { EarlyAdmissionQuiz } from "@/components/early-admission/EarlyAdmissionQuiz";
import { PhaseGate } from "@/components/early-admission/PhaseGate";
import {
  GROUP_TEST_INTRO,
  GROUP_TEST_QUESTIONS,
} from "@/data/earlyAdmission/groupTest";

export default function GroupTestPage() {
  return (
    <PhaseGate phase="group">
      <EarlyAdmissionQuiz
        phase="group"
        title={GROUP_TEST_INTRO.title}
        introTips={GROUP_TEST_INTRO.tips}
        passScore={GROUP_TEST_INTRO.passScore}
        questions={GROUP_TEST_QUESTIONS}
        backHref="/early-admission"
      />
    </PhaseGate>
  );
}
