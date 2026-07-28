import { loadComponent } from "./assets/js/componentloader.js";

async function initialize() {

    await loadComponent("app", "./components/layout.html");

    await loadComponent("sidebar-container", "./components/sidebar.html");

    await loadComponent("navbar-container", "./components/navbar.html");

    // await loadComponent("content", "./components/dashboard/dashboard.html");
    await loadComponent("pos", "./components/pos/pos.html");

}

initialize();




