import { InterviewDetail } from "@/components/dashboard/interview-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <InterviewDetail interviewId={id} />;
}
