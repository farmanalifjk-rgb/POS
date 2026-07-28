import { Sidebar } from "../src/components/Sidebar";

export function MainLayout(content) {
  return `
    <div class="flex h-screen bg-slate-100">

      ${Sidebar()}

      <main
        class="flex-1 overflow-y-auto p-8"
        id="page-content"
      >
        ${content}
      </main>

    </div>
  `;
}