<template>
    <div class="flex min-h-dvh w-dvw flex-col">
        <!-- Header -->
        <div class="flex shrink-0 items-center bg-body-900 px-4 py-3">
            <div class="flex items-center gap-x-4">
                <cd-logo class="size-12 text-primary-300" />
                <span class="font-bold text-body-300">Creative draw</span>
            </div>
            <div class="flex-1"></div>
            <cd-btn
                to="https://github.com/sidekick-coder/creative-draw"
                variant="text"
                target="_blank"
            >
                <cd-icon name="mdi:github" class="mr-2" />
                <span>Github</span>
            </cd-btn>
            <cd-btn to="/projects"> Open app </cd-btn>
        </div>

        <!-- Hero Section -->
        <div
            class="flex h-[80dvh] flex-col items-center justify-center gap-y-8"
            :style="{
                'background-image': 'radial-gradient(rgba(255,255,255, 0.2) 1px, transparent 1px)',
                'background-size': '30px 30px',
            }"
        >
            <cd-logo class="size-40 rounded-full text-primary-300" />
            <div class="text-center">
                <h1 class="mb-2 text-4xl font-bold">Creative draw</h1>
                <h2 class="max-w-lg text-body-100">
                    Free open-source drawing app. Works seamlessly in your browser on desktop and
                    mobile – no installation needed!
                </h2>
            </div>
            <div class="flex flex-col items-center gap-y-2">
                <cd-btn to="/projects"> Start drawing </cd-btn>
            </div>
        </div>

        <!-- Features Section -->
        <section class="bg-body-800 px-4 py-16">
            <div class="mx-auto max-w-6xl">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">Why Choose Creative Draw?</h2>
                    <p class="text-body-100 max-w-2xl mx-auto">
                        Experience the freedom of digital art with powerful tools designed for
                        creators of all levels
                    </p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div
                            class="bg-primary-300 rounded-full size-16 mx-auto mb-4 flex items-center justify-center"
                        >
                            <cd-icon name="mdi:brush" class="text-2xl text-white" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Drawing Tools</h3>
                        <p class="text-body-100">
                            Essential drawing tools including brushes, eraser, and customizable
                            settings for digital art creation
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-secondary-300 rounded-full size-16 mx-auto mb-4 flex items-center justify-center"
                        >
                            <cd-icon name="mdi:layers" class="text-2xl text-white" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Layer Support</h3>
                        <p class="text-body-100">
                            Organize your artwork with multiple layers for complex compositions and
                            easy editing
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-success-300 rounded-full size-16 mx-auto mb-4 flex items-center justify-center"
                        >
                            <cd-icon name="mdi:devices" class="text-2xl text-white" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Cross-Platform</h3>
                        <p class="text-body-100">
                            Draw anywhere, anytime. Works perfectly on desktop, tablet, and mobile
                            devices
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-warning-300 rounded-full size-16 mx-auto mb-4 flex items-center justify-center"
                        >
                            <cd-icon name="mdi:cloud-off" class="text-2xl text-white" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">No Installation</h3>
                        <p class="text-body-100">
                            Start creating immediately - no downloads, no setup, just pure
                            creativity
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-info-300 rounded-full size-16 mx-auto mb-4 flex items-center justify-center"
                        >
                            <cd-icon
                                name="mdi:open-source-initiative"
                                class="text-2xl text-white"
                            />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Open Source</h3>
                        <p class="text-body-100">
                            Free forever with transparent development and community-driven
                            improvements
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-danger-300 rounded-full size-16 mx-auto mb-4 flex items-center justify-center"
                        >
                            <cd-icon name="mdi:history" class="text-2xl text-white" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Undo/Redo</h3>
                        <p class="text-body-100">
                            Experiment fearlessly with comprehensive history and version control
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- App Screenshots Section -->
        <section class="bg-body-900 px-4 py-16">
            <div class="mx-auto max-w-6xl">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">See Creative Draw in Action</h2>
                    <p class="text-body-100 max-w-2xl mx-auto">
                        Experience the intuitive interface and powerful features that make digital
                        art creation effortless
                    </p>
                </div>

                <div class="space-y-16">
                    <!-- Main Canvas Screenshot -->
                    <div class="text-center">
                        <div class="mb-6">
                            <h3 class="text-2xl font-semibold mb-2">Intuitive Drawing Interface</h3>
                            <p class="text-body-100">
                                Clean, distraction-free workspace with all tools at your fingertips
                            </p>
                        </div>
                        <div
                            class="bg-body-600 rounded-lg border border-body-500 aspect-video mx-auto max-w-4xl flex items-center justify-center overflow-hidden"
                        >
                            <cd-img src="/screenshot-lg.png" />
                        </div>
                    </div>

                    <!-- Tools Screenshot -->
                    <div class="grid lg:grid-cols-2 gap-12 items-center">
                        <div class="order-2 lg:order-1">
                            <h3 class="text-2xl font-semibold mb-4">Professional Drawing Tools</h3>
                            <p class="text-body-100 mb-6">
                                Access essential drawing and editing tools designed for digital
                                artists of all skill levels.
                            </p>
                            <ul class="space-y-3 text-body-100">
                                <li class="flex items-center gap-x-3">
                                    <cd-icon name="mdi:brush" class="text-primary-300" />
                                    <span>Drawing tools with adjustable settings</span>
                                </li>
                                <li class="flex items-center gap-x-3">
                                    <cd-icon name="mdi:palette" class="text-primary-300" />
                                    <span>Advanced color picker</span>
                                </li>
                                <li class="flex items-center gap-x-3">
                                    <cd-icon name="mdi:layers" class="text-primary-300" />
                                    <span>Layer management</span>
                                </li>
                            </ul>
                        </div>
                        <div class="order-1 lg:order-2">
                            <div
                                class="bg-body-600 rounded-lg border border-body-500 aspect-square flex items-center justify-center"
                            >
                                <cd-img src="/screenshot-color-picker-square.png" />
                            </div>
                        </div>
                    </div>

                    <!-- Layer Management Screenshot -->
                    <div class="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div
                                class="bg-body-600 rounded-lg border border-body-500 aspect-square flex items-center justify-center"
                            >
                                <cd-img src="/screenshot-layer-management.png" />
                            </div>
                        </div>
                        <div>
                            <h3 class="text-2xl font-semibold mb-4">Layer Management</h3>
                            <p class="text-body-100 mb-6">
                                Organize your artwork with powerful layer controls. Create complex
                                compositions with ease using our intuitive layer system.
                            </p>
                            <ul class="space-y-3 text-body-100">
                                <li class="flex items-center gap-x-3">
                                    <cd-icon name="mdi:layers-plus" class="text-secondary-300" />
                                    <span>Add and remove layers</span>
                                </li>
                                <li class="flex items-center gap-x-3">
                                    <cd-icon name="mdi:eye" class="text-secondary-300" />
                                    <span>Show/hide layer visibility</span>
                                </li>
                                <li class="flex items-center gap-x-3">
                                    <cd-icon name="mdi:opacity" class="text-secondary-300" />
                                    <span>Adjust layer opacity</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Development Status Section -->
        <section class="bg-body-600 px-4 py-16 flex items-center">
            <div class="mx-auto max-w-4xl">
                <div class="mb-8 text-center">
                    <h2 class="text-3xl font-bold mb-4">Constantly Evolving</h2>
                    <p class="text-body-100 text-lg max-w-2xl mx-auto">
                        Creative Draw is actively developed with new features and improvements added
                        regularly. Your feedback shapes the future of the app.
                    </p>
                </div>

                <div class="flex flex-wrap gap-y-8 mb-8">
                    <div class="bg-body-700 rounded-lg p-6 w-full">
                        <h3 class="text-xl font-semibold mb-3">Feature Requests Welcome</h3>
                        <p class="text-body-100 mb-4">
                            Missing a feature you need? We're always looking to add new tools and
                            capabilities based on user feedback.
                        </p>
                        <a
                            href="https://github.com/sidekick-coder/creative-draw/issues"
                            target="_blank"
                            class="text-success-300 hover:text-success-200 transition-colors inline-flex items-center gap-x-2"
                        >
                            <cd-icon name="mdi:github" />
                            <span>Request a Feature</span>
                        </a>
                    </div>

                    <div class="bg-body-700 rounded-lg p-6 w-full">
                        <h3 class="text-xl font-semibold mb-3">Regular Updates</h3>
                        <p class="text-body-100 mb-4">
                            New features, bug fixes, and improvements are released frequently. The
                            app gets better with each update.
                        </p>
                        <a
                            href="https://github.com/sidekick-coder/creative-draw/releases"
                            target="_blank"
                            class="text-info-300 hover:text-info-200 transition-colors inline-flex items-center gap-x-2"
                        >
                            <cd-icon name="mdi:history" />
                            <span>View Updates</span>
                        </a>
                    </div>
                </div>

                <div class="bg-body-700 rounded-lg p-6">
                    <div class="flex flex-col md:flex-row items-center gap-6">
                        <div class="flex-shrink-0">
                            <cd-icon name="mdi:github" class="text-4xl text-body-200" />
                        </div>
                        <div class="text-center md:text-left">
                            <h3 class="text-xl font-semibold mb-2">Open Source Development</h3>
                            <p class="text-body-100">
                                Join our community of contributors! Help shape Creative Draw by
                                reporting bugs, suggesting features, or contributing code.
                            </p>
                        </div>
                        <div class="flex-shrink-0">
                            <cd-btn
                                to="https://github.com/sidekick-coder/creative-draw"
                                variant="outline"
                                target="_blank"
                                class="text-body-100 border-body-300 hover:bg-body-500"
                            >
                                Contribute
                            </cd-btn>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="bg-primary-300 px-4 py-16">
            <div class="mx-auto max-w-4xl text-center">
                <h2 class="text-3xl font-bold mb-4 text-white">Ready to Start Creating?</h2>
                <p class="text-primary-50 mb-8 text-lg">
                    Join thousands of artists already using Creative Draw to bring their ideas to
                    life
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <cd-btn
                        to="/projects"
                        variant="outlined"
                        class="text-white border-white hover:bg-white hover:text-primary-300"
                    >
                        Start Drawing Now
                    </cd-btn>
                    <cd-btn
                        to="https://github.com/sidekick-coder/creative-draw"
                        variant="text"
                        target="_blank"
                        class="text-primary-50 hover:text-white"
                    >
                        <cd-icon name="mdi:github" class="mr-2" />
                        View on GitHub
                    </cd-btn>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-body-900 px-4 py-8">
            <div class="mx-auto max-w-6xl">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="flex items-center gap-x-4 mb-4 md:mb-0">
                        <cd-logo class="size-8 text-primary-300" />
                        <span class="font-semibold text-body-300">Creative Draw</span>
                    </div>

                    <div class="flex gap-x-6 text-body-100">
                        <a
                            href="https://github.com/sidekick-coder/creative-draw"
                            target="_blank"
                            class="hover:text-primary-300 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://github.com/sidekick-coder/creative-draw/issues"
                            target="_blank"
                            class="hover:text-primary-300 transition-colors"
                        >
                            Issues
                        </a>
                        <a
                            href="https://github.com/sidekick-coder/creative-draw/blob/main/LICENSE"
                            target="_blank"
                            class="hover:text-primary-300 transition-colors"
                        >
                            License
                        </a>
                    </div>
                </div>

                <div class="border-t border-body-700 mt-6 pt-6 text-center text-body-200">
                    <p>&copy; 2025 Creative Draw. Open source project by Sidekick Coder.</p>
                </div>
            </div>
        </footer>
    </div>
</template>
