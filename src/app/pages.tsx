export default async function Pages() {
    const data = await fetch('https://api.vercel.app/blog')
    const posts = await data.json()
    return (
        <ul>
            {posts.map((post: { id: string | number; title: string }) => (
                <li key={post.id}>{post.title}</li>
            ))}
        </ul>
    )
}