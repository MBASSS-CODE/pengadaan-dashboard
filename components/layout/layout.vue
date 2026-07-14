<template>
    <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
        <SidebarLayout class="min-h-192! relative!">
            <SidebarBackdrop v-if="isMobile && (open || secondaryOpen)" class="absolute!" />
            <!-- Icon bar - always collapsed, opens on hover as overlay -->
            <Sidebar id="iconbar" side="left" :collapsible="isMobile ? 'offcanvas' : 'icon'" :overlay="true" :openOnHover="!isMobile" width="12rem" v-model:open="open">
                <SidebarSpacer />
                <SidebarAside>
                    <SidebarPanel>
                        <SidebarHeader>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton class="p-1!">
                                        <div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold leading-none">A</div>
                                        <span class="font-semibold text-sm">Acme Inc</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarHeader>

                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton :isActive="true">
                                                <Home />
                                                <span>Home</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <Database />
                                                <span>Database</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <Key />
                                                <span>Authentication</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <Server />
                                                <span>Edge Functions</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <Globe />
                                                <span>Storage</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <Code />
                                                <span>SQL Editor</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>

                        <SidebarFooter>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <Cog />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </SidebarPanel>
                </SidebarAside>
            </Sidebar>

            <!-- Secondary sidebar - always open on desktop, offcanvas on mobile -->
            <Sidebar id="secondary" side="left" width="14rem" :collapsible="isMobile ? 'offcanvas' : 'none'" :overlay="isMobile" v-model:open="secondaryOpen">
                <SidebarSpacer />
                <SidebarAside>
                    <SidebarPanel>
                        <SidebarHeader>
                            <div class="px-1">
                                <span class="font-semibold text-sm">Settings</span>
                            </div>
                        </SidebarHeader>

                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton :isActive="true"><span>General</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>Compute and Disk</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>Infrastructure</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>Integrations</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>API Keys</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>JWT Keys</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>Log Drains</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton><span>Add-ons</span></SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>

                            <SidebarGroup>
                                <SidebarGroupLabel>Integrations</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <span>Data API</span>
                                                <ExternalLink class="ml-auto" />
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <span>Vault</span>
                                                <SidebarMenuBadge>BETA</SidebarMenuBadge>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>

                            <SidebarGroup>
                                <SidebarGroupLabel>Billing</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <span>Subscription</span>
                                                <ExternalLink class="ml-auto" />
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>
                                                <span>Usage</span>
                                                <ExternalLink class="ml-auto" />
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </SidebarPanel>
                </SidebarAside>
            </Sidebar>

            <!-- Main content -->
            <SidebarMain>
                <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                    <SidebarTrigger v-if="isMobile" target="iconbar" severity="secondary" :text="true" size="small">
                        <SidebarIcon />
                    </SidebarTrigger>
                    <SidebarTrigger v-if="isMobile" target="secondary" severity="secondary" :text="true" size="small">
                        <Cog />
                    </SidebarTrigger>
                    <span class="text-sm font-medium">Table Editor</span>
                    <span class="text-xs text-muted-color">/ users</span>
                </header>
                <div class="flex-1 p-4 flex flex-col gap-4">
                    <slot />
                </div>
            </SidebarMain>
        </SidebarLayout>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

import Code from '@primeicons/vue/code';
import Cog from '@primeicons/vue/cog';
import Database from '@primeicons/vue/database';
import ExternalLink from '@primeicons/vue/external-link';
import Globe from '@primeicons/vue/globe';
import Home from '@primeicons/vue/home';
import Key from '@primeicons/vue/key';
import Server from '@primeicons/vue/server';
import SidebarIcon from '@primeicons/vue/sidebar';

const isMobile = ref(false);
const open = ref(false);
const secondaryOpen = ref(true);
let mql = null;
let onMqlChange = null;

onMounted(() => {
    if (typeof window === 'undefined') return;

    mql = window.matchMedia('(max-width: 1023px)');
    isMobile.value = mql.matches;
    secondaryOpen.value = !isMobile.value;
    onMqlChange = (event) => {
        isMobile.value = event.matches;
        secondaryOpen.value = !event.matches;
    };
    mql.addEventListener('change', onMqlChange);
});

onBeforeUnmount(() => {
    if (mql && onMqlChange) {
        mql.removeEventListener('change', onMqlChange);
    }
});
</script>