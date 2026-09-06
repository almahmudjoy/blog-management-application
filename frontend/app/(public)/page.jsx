/** Guest homepage (requirement 5). All blog data comes from GET /api/blogs. */
import { Suspense } from "react";
import BlogExplorer from "@/components/BlogExplorer";
import Loader from "@/components/Loader";

export const metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <Suspense fallback={<Loader label="Loading blogs..." />}>
      <BlogExplorer />
    </Suspense>
  );
}
