import { ContentPage } from '@/components/features/content/ContentPage'

interface Props {
    params: Promise<{ id: string }>
}

export default async function TVPage({ params }: Props) {
    const { id } = await params
    return <ContentPage id={Number(id)} type="tv" />
}