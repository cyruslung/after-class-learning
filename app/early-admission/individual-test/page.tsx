import { EarlyAdmissionQuiz } from "@/components/early-admission/EarlyAdmissionQuiz";
import { PhaseGate } from "@/components/early-admission/PhaseGate";
import {
  INDIVIDUAL_TEST_INTRO,
  INDIVIDUAL_TEST_QUESTIONS,
} from "@/data/earlyAdmission/individualTest";

export default function IndividualTestPage() {
  return (
    <PhaseGate phase="individual">
      <EarlyAdmissionQuiz
        phase="individual"
        title={INDIVIDUAL_TEST_INTRO.title}
        introTips={INDIVIDUAL_TEST_INTRO.tips}
        passScore={INDIVIDUAL_TEST_INTRO.passScore}
        questions={INDIVIDUAL_TEST_QUESTIONS}
        backHref="/early-admission"
      />
    </PhaseGate>
  );
}
