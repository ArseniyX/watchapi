import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const collections = [
  {
    id: 1,
    name: "User Management API",
    description: "Authentication and user profile endpoints",
    requests: 12,
    lastModified: "2 hours ago",
    method: "GET",
    url: "/api/users",
    status: "active",
  },
  {
    id: 2,
    name: "Payment Processing",
    description: "Stripe integration and payment flows",
    requests: 8,
    lastModified: "1 day ago",
    method: "POST",
    url: "/api/payments",
    status: "active",
  },
  {
    id: 3,
    name: "Product Catalog",
    description: "E-commerce product management",
    requests: 15,
    lastModified: "3 days ago",
    method: "GET",
    url: "/api/products",
    status: "draft",
  },
  {
    id: 4,
    name: "Order Management",
    description: "Order creation and tracking",
    requests: 6,
    lastModified: "1 week ago",
    method: "PUT",
    url: "/api/orders",
    status: "active",
  },
]

const methodColors = {
  GET: "bg-green-500/10 text-green-500 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function CollectionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">Organize and manage your API requests</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search collections..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge
                    className={`font-mono text-xs ${methodColors[collection.method as keyof typeof methodColors]}`}
                  >
                    {collection.method}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <CardDescription className="mt-1">{collection.description}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="font-mono">{collection.url}</span>
                  <span>{collection.requests} requests</span>
                  <span>Modified {collection.lastModified}</span>
                </div>
                <Badge variant={collection.status === "active" ? "default" : "secondary"}>{collection.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
