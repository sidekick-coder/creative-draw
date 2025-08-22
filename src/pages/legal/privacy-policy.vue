<template>
    <div class="flex min-h-dvh w-dvw flex-col">
        <!-- Header -->
        <div class="flex shrink-0 items-center bg-body-900 px-4 py-3">
            <div class="flex items-center gap-x-4">
                <cd-logo class="size-12 text-primary-300" />
                <span class="font-bold text-body-300">Creative draw</span>
            </div>
            <div class="flex-1"></div>
            <cd-btn to="/" variant="text">
                <cd-icon name="mdi:arrow-left" class="mr-2" />
                <span>Back to App</span>
            </cd-btn>
        </div>

        <!-- Content -->
        <div class="flex-1 bg-body-800 px-4 py-8">
            <div class="mx-auto max-w-4xl">
                <cd-card>
                    <cd-card-head>
                        <cd-card-title class="text-3xl">Privacy Policy</cd-card-title>
                    </cd-card-head>

                    <cd-card-content class="space-y-8">
                        <!-- Last Updated -->
                        <div class="text-sm text-body-100">
                            <strong>Last updated:</strong> August 22, 2025
                        </div>

                        <!-- Introduction -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">Introduction</h2>
                            <p class="text-body-100 leading-relaxed">
                                Welcome to Creative Draw. We are committed to protecting your
                                privacy and ensuring transparency about how we handle your data.
                                This Privacy Policy explains what information we collect, how we use
                                it, and your rights regarding your personal information.
                            </p>
                        </section>

                        <!-- Information We Collect -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                Information We Collect
                            </h2>

                            <h3 class="text-lg font-medium mb-3 text-body-100">Analytics Data</h3>
                            <p class="text-body-100 leading-relaxed mb-4">
                                We collect anonymous analytics data about how you use Creative Draw
                                to help us improve the application. This includes:
                            </p>
                            <ul class="list-disc list-inside text-body-100 space-y-2 ml-4">
                                <li>Page views and navigation patterns</li>
                                <li>Feature usage statistics</li>
                                <li>Device type and browser information</li>
                                <li>General geographic location (country/region level)</li>
                                <li>Performance metrics and error reports</li>
                            </ul>

                            <h3 class="text-lg font-medium mb-3 mt-6 text-body-100">
                                Local Storage Data
                            </h3>
                            <p class="text-body-100 leading-relaxed">
                                Creative Draw stores your drawings, projects, and application
                                settings locally in your browser. This data remains on your device
                                and is not transmitted to our servers unless you explicitly choose
                                to save or share it.
                            </p>
                        </section>

                        <!-- What We Don't Collect -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                What We Don't Collect
                            </h2>
                            <p class="text-body-100 leading-relaxed mb-4">
                                We are committed to minimal data collection. We explicitly do NOT
                                collect:
                            </p>
                            <ul class="list-disc list-inside text-body-100 space-y-2 ml-4">
                                <li>
                                    Personal identification information (names, email addresses,
                                    phone numbers)
                                </li>
                                <li>Cookies for tracking or identification purposes</li>
                                <li>
                                    Your drawings or creative content (unless you choose to share
                                    them)
                                </li>
                                <li>Login credentials or account information</li>
                                <li>Financial or payment information</li>
                            </ul>
                        </section>

                        <!-- Cookies and Tracking -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                Cookies and Tracking
                            </h2>
                            <p class="text-body-100 leading-relaxed">
                                Creative Draw does not use cookies for tracking or user
                                identification. We may use essential cookies only for basic
                                application functionality, such as remembering your preferences
                                during your session. These cookies do not collect personal
                                information and are automatically deleted when you close your
                                browser.
                            </p>
                        </section>

                        <!-- Third-Party Services -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                Third-Party Services
                            </h2>

                            <h3 class="text-lg font-medium mb-3 text-body-100">Google Analytics</h3>
                            <p class="text-body-100 leading-relaxed mb-4">
                                We use Google Analytics to understand how visitors use our
                                application. Google Analytics collects anonymous information about
                                your visit, including pages viewed, time spent on the site, and
                                basic demographic information. This data is anonymized and used
                                solely for improving our service.
                            </p>

                            <h3 class="text-lg font-medium mb-3 text-body-100">Google Ads</h3>
                            <p class="text-body-100 leading-relaxed">
                                To support the development and hosting of Creative Draw, we display
                                advertisements through Google Ads. Google may collect and use
                                information about your visits to this and other websites to provide
                                targeted advertisements. You can opt out of personalized advertising
                                by visiting Google's Ad Settings or by using browser extensions that
                                block advertisements.
                            </p>
                        </section>

                        <!-- How We Use Information -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                How We Use Information
                            </h2>
                            <p class="text-body-100 leading-relaxed mb-4">
                                The limited information we collect is used exclusively for:
                            </p>
                            <ul class="list-disc list-inside text-body-100 space-y-2 ml-4">
                                <li>
                                    Improving the performance and functionality of Creative Draw
                                </li>
                                <li>Understanding which features are most popular and useful</li>
                                <li>Identifying and fixing technical issues</li>
                                <li>Making informed decisions about future development</li>
                                <li>Supporting the application through advertising revenue</li>
                            </ul>
                        </section>

                        <!-- Data Sharing -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">Data Sharing</h2>
                            <p class="text-body-100 leading-relaxed">
                                We do not sell, trade, or otherwise transfer your information to
                                third parties, except for the analytics and advertising services
                                mentioned above. All data shared with these services is anonymous
                                and cannot be used to identify individual users.
                            </p>
                        </section>

                        <!-- Your Rights and Choices -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                Your Rights and Choices
                            </h2>
                            <p class="text-body-100 leading-relaxed mb-4">
                                You have the following rights regarding your data:
                            </p>
                            <ul class="list-disc list-inside text-body-100 space-y-2 ml-4">
                                <li>
                                    Opt out of analytics tracking by using browser settings or
                                    extensions
                                </li>
                                <li>Block advertisements using ad-blocking browser extensions</li>
                                <li>
                                    Clear your local storage data at any time through your browser
                                    settings
                                </li>
                                <li>
                                    Stop using the application to prevent any further data
                                    collection
                                </li>
                            </ul>
                        </section>

                        <!-- Data Security -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">Data Security</h2>
                            <p class="text-body-100 leading-relaxed">
                                Since Creative Draw operates primarily in your browser with local
                                storage, your creative work and personal data remain on your device.
                                We implement appropriate security measures for any data that is
                                transmitted, including the use of HTTPS encryption for all
                                communications.
                            </p>
                        </section>

                        <!-- Children's Privacy -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                Children's Privacy
                            </h2>
                            <p class="text-body-100 leading-relaxed">
                                Creative Draw is suitable for users of all ages. We do not knowingly
                                collect personal information from children under 13. Since we don't
                                collect personal information from any users, this application is
                                safe for children to use under appropriate supervision.
                            </p>
                        </section>

                        <!-- Changes to This Policy -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">
                                Changes to This Policy
                            </h2>
                            <p class="text-body-100 leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect
                                changes in our practices or legal requirements. Any changes will be
                                posted on this page with an updated "Last Modified" date. We
                                encourage you to review this policy periodically.
                            </p>
                        </section>

                        <!-- Contact Information -->
                        <section>
                            <h2 class="text-xl font-semibold mb-4 text-body-50">Contact Us</h2>
                            <p class="text-body-100 leading-relaxed mb-4">
                                If you have any questions or concerns about this Privacy Policy or
                                our data practices, please contact us:
                            </p>
                            <div class="bg-body-700 rounded-lg p-4">
                                <p class="text-body-100">
                                    <strong>GitHub Issues:</strong>
                                    <a
                                        href="https://github.com/sidekick-coder/creative-draw/issues"
                                        target="_blank"
                                        class="text-primary-300 hover:text-primary-200 ml-2"
                                    >
                                        Report an issue or ask questions
                                    </a>
                                </p>
                                <p class="text-body-100 mt-2">
                                    <strong>Project:</strong>
                                    <a
                                        href="https://github.com/sidekick-coder/creative-draw"
                                        target="_blank"
                                        class="text-primary-300 hover:text-primary-200 ml-2"
                                    >
                                        Creative Draw on GitHub
                                    </a>
                                </p>
                            </div>
                        </section>

                        <!-- Acknowledgment -->
                        <section class="border-t border-body-600 pt-6">
                            <p class="text-body-100 leading-relaxed">
                                By using Creative Draw, you acknowledge that you have read and
                                understood this Privacy Policy and agree to the collection and use
                                of information in accordance with this policy.
                            </p>
                        </section>
                    </cd-card-content>
                </cd-card>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-body-900 px-4 py-6">
            <div class="mx-auto max-w-4xl">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-x-4">
                        <cd-logo class="size-8 text-primary-300" />
                        <span class="text-body-300">Creative Draw</span>
                    </div>
                    <div class="flex gap-x-6 text-sm text-body-100">
                        <a
                            href="https://github.com/sidekick-coder/creative-draw"
                            target="_blank"
                            class="hover:text-primary-300 transition-colors"
                        >
                            GitHub
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
                <div class="border-t border-body-700 mt-4 pt-4 text-center text-body-200 text-sm">
                    <p>&copy; 2025 Creative Draw. Open source project by Sidekick Coder.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
    title: 'Privacy Policy - Creative Draw',
    meta: [
        {
            name: 'description',
            content:
                'Privacy Policy for Creative Draw - Learn how we protect your privacy and handle data in our free, open-source drawing application.',
        },
    ],
})
</script>
