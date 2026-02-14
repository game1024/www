import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface SidebarAvatarProps {
  src?: string
  fallback?: string
  alt?: string
}

export function SidebarAvatar({ src, fallback = "U", alt = "User" }: SidebarAvatarProps) {
  return (
    <Avatar className="size-32">
      {src && <AvatarImage src={src} alt={alt} loading="lazy" />}
      <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
    </Avatar>
  )
}
