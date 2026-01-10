import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Upload, Heart, Share2 } from "lucide-react"

export default function UXTestPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-12 max-w-4xl">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    UI/UX Verification Suite
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manual verification playground for Micro-interactions, Transitions, and Loading States.
                </p>
            </div>

            {/* Button Interaction Test */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-2xl font-semibold">1. Button Micro-interactions</h2>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Expected: active:scale-95 + Color Transition</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Variants</CardTitle>
                            <CardDescription>Test click responsiveness on all types</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button>Default</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sizes & Icons</CardTitle>
                            <CardDescription>Verify icon scaling and alignment</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-4">
                            <Button size="lg">Large Button</Button>
                            <Button size="sm">Small</Button>
                            <Button size="icon" variant="outline">
                                <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </Button>
                            <Button>
                                <Upload className="mr-2 h-4 w-4" /> With Icon
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Skeleton & Loading Test */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-2xl font-semibold">2. Loading States</h2>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Expected: Smooth Shimmer vs Static Pulse</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-medium">Standard Skeleton (with Shimmer)</h3>
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                        <Skeleton className="h-[125px] w-full rounded-xl" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Button Loading State</h3>
                        <div className="flex gap-4">
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animation Gallery */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-2xl font-semibold">3. Global Animations</h2>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Check: Smoothness & CPU usage</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="aspect-square rounded-lg border bg-card flex flex-col items-center justify-center gap-2 p-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse-slow" />
                        <span className="text-xs text-muted-foreground">Pulse Slow</span>
                    </div>

                    <div className="aspect-square rounded-lg border bg-card flex flex-col items-center justify-center gap-2 p-4">
                        <div className="w-12 h-12 bg-secondary/20 rounded-lg animate-float" />
                        <span className="text-xs text-muted-foreground">Float</span>
                    </div>

                    <div className="aspect-square rounded-lg border bg-card flex flex-col items-center justify-center gap-2 p-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-lg animate-blob" />
                        <span className="text-xs text-muted-foreground">Blob</span>
                    </div>

                    <div className="aspect-square rounded-lg border bg-card flex flex-col items-center justify-center gap-2 p-4 overflow-hidden relative">
                        <div className="absolute inset-0 bg-muted/50 animate-shimmer" />
                        <span className="relative z-10 text-xs text-muted-foreground">Shimmer</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
