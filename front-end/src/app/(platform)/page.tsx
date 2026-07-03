import { ContentCard } from "@/components/features/ContentCard";

export default function RootPage() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            <ContentCard id={603} title="Matrix" posterPath="/lDqMDI3xpbB9UQRyeXfei0MXhqb.jpg" mediaType="movie" voteAverage={8.2} />
            <ContentCard id={1} title="Sem pôster" posterPath={null} mediaType="tv" />
            <ContentCard id={27205} title="Inception" posterPath="/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" mediaType="movie" voteAverage={8.4} />
            <ContentCard id={157336} title="Interstellar" posterPath="/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" mediaType="movie" voteAverage={8.6} />
        </div>
    )
}