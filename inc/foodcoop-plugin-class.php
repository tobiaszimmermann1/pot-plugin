<?php
class FoodcoopPlugin {
  function __construct() {
    add_action( 'admin_menu', array($this, 'foodcoop_menu') );
  }

  function foodcoop_menu() {
    $menu = add_menu_page( 'Foodcoop', 'Foodcoop', 'manage_options', 'foodcoop-plugin', array($this, 'foodcoop_plugin_page'), 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0ODMuMSA0ODMuMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDgzLjEgNDgzLjE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNNDM0LjU1LDQxOC43bC0yNy44LTMxMy4zYy0wLjUtNi4yLTUuNy0xMC45LTEyLTEwLjloLTU4LjZjLTAuMS01Mi4xLTQyLjUtOTQuNS05NC42LTk0LjVzLTk0LjUsNDIuNC05NC42LDk0LjVoLTU4LjYKCQljLTYuMiwwLTExLjQsNC43LTEyLDEwLjlsLTI3LjgsMzEzLjNjMCwwLjQsMCwwLjcsMCwxLjFjMCwzNC45LDMyLjEsNjMuMyw3MS41LDYzLjNoMjQzYzM5LjQsMCw3MS41LTI4LjQsNzEuNS02My4zCgkJQzQzNC41NSw0MTkuNCw0MzQuNTUsNDE5LjEsNDM0LjU1LDQxOC43eiBNMjQxLjU1LDI0YzM4LjksMCw3MC41LDMxLjYsNzAuNiw3MC41aC0xNDEuMkMxNzEuMDUsNTUuNiwyMDIuNjUsMjQsMjQxLjU1LDI0egoJCSBNMzYzLjA1LDQ1OWgtMjQzYy0yNiwwLTQ3LjItMTcuMy00Ny41LTM4LjhsMjYuOC0zMDEuN2g0Ny42djQyLjFjMCw2LjYsNS40LDEyLDEyLDEyczEyLTUuNCwxMi0xMnYtNDIuMWgxNDEuMnY0Mi4xCgkJYzAsNi42LDUuNCwxMiwxMiwxMnMxMi01LjQsMTItMTJ2LTQyLjFoNDcuNmwyNi44LDMwMS44QzQxMC4yNSw0NDEuNywzODkuMDUsNDU5LDM2My4wNSw0NTl6Ii8+CjwvZz4KPC9zdmc+', 55 );
    add_action( 'load-' . $menu, array($this, 'fc_admin_styles_normalize') );
  }

  function fc_admin_styles_normalize() {
    wp_deregister_style('wp-admin');
  }

  function foodcoop_plugin_page() { ?>
    <div class="fc_wrap">
      <div id="fc_dashboard"></div>
      <?php

      ?>
    </div>
  <?php }
}
