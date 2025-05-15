<?php

class FoodcoopProductImport {

  function __construct() {
    add_action( 'admin_menu', array($this, 'foodcoop_product_import') );    
  }

  function foodcoop_product_import() {
    $menu = add_submenu_page( 'foodcoop-plugin', 'Produkte Import', 'Produkte Import', 'manage_woocommerce', 'foodcoop-product-import', array($this, 'foodcoop_product_import_page'), 10 );
    add_action( "load-{$menu}", array($this, 'load_admin_js') );
  }

  function load_admin_js(){
    add_action( 'admin_enqueue_scripts', array($this, 'enqueue_admin_js') );
  }

  function enqueue_admin_js(){
    wp_enqueue_script( 'product-import-upload', FOODCOOP_PLUGIN_URL. 'scripts/product-import/product-import-upload.js?version=1.7.8', array( 'jquery-ui-core', 'jquery-ui-tabs' ), null, false );  
    wp_localize_script( 'product-import-upload', 'importLocalizer', array(
      'apiUrl' => home_url('/wp-json'),
      'homeUrl' => home_url(),
      'adminUrl' => parse_url(admin_url())['path'].'admin.php?page=foodcoop-product-import',
      'pluginUrl' => plugin_dir_url(__FILE__),
      'nonce' => wp_create_nonce('wp_rest'),
      'currentUser' => wp_get_current_user(),
    ));
  }

  function foodcoop_product_import_page() { 
    $active_step = 1;
    $is_error = false;
    $error_msg = null;

    if (isset($_GET['step'])) {
      $active_step = intval($_GET['step']);

      $file_path = null;
      if ($active_step === 1 || $active_step === 2 || $active_step === 3) {
        // sanitize file path
        $file_path = str_replace('\\\\', '\\', $_GET['file']);
        $file_path = str_replace('\\\\', '\\', $file_path);
        $file_path = str_replace('\\\\', '\\', $file_path);
        $file_path = str_replace('\\\\', '\\', $file_path);
      }

      // in step 2, make sure that file path is correct
      if ($active_step === 2) {
        if (!isset($_GET['file']) || !file_exists($file_path) ) {
          $error_msg = __("Datei wurde nicht gefunden.", "fcplugin");
          $is_error = true;
        } 
      }

      // in step 2, make sure that file path is correct
      if ($active_step === 3) {
        // verify that we have the data from the file 
        $transient_data = json_decode(get_transient("foodcoop_import_".$file_path));

        if (empty($transient_data)) {
          $error_msg = __("Daten wurden nicht gefunden.", "fcplugin");
          $is_error = true;
        } else {
          $data = $transient_data->data;
          $formatting_errors = $transient_data->errors;
          $rows_with_errors = $transient_data->rows_with_errors;
          $_GET['del'] === "true" ? $foodcoop_product_import_delete = "true" : $foodcoop_product_import_delete = "false";
        }
      }

      // in step 4
      if ($active_step === 4) {
        if (!isset($_GET['updatedproducts']) && !isset($_GET['newproducts']) ) {
          $error_msg = __("Fehler während dem Import.", "fcplugin");
          $is_error = true;
        }
      }

    }
    
    ?>
    <div class="wrap woocommerce">
      <h1 class="wp-heading-inline">Produkte Import</h1>     
      <div class="foodcoop_import_wrapper">

        <div class="foodcoop_import_progress_bar_wrapper">
          <ol class="foodcoop_import_progress_bar_steps">
            <li <?php if ($active_step === 1) echo 'class="active"'; ?>>
              <?php echo __("Datei hochladen", "fcplugin"); ?>
            </li>
            <li <?php if ($active_step === 2) echo 'class="active"'; ?>>
              <?php echo __("Einstellungen", "fcplugin"); ?>
            </li>
            <li <?php if ($active_step === 3) echo 'class="active"'; ?>>
              <?php echo __("Importieren", "fcplugin"); ?>
            </li>
            <li <?php if ($active_step === 4) echo 'class="active"'; ?>>
              <?php echo __("Fertig!", "fcplugin"); ?>
            </li>
          </ol>
        </div>

        <?php
        if ($error_msg) { ?>
          <div class="foodcoop_error error inline">
            <p><?php echo $error_msg; ?></p>
          </div>
        <?php 
        }
        ?>

        <div class="foodcoop_file_import_content_wrapper">

          <!-- 
            Step Content
          -->

          <?php
          if ($active_step === 1 && $is_error === false) { ?>

            <form id="foodcoop_product_import_step1">
            
              <div class="foodcoop_file_import_content_header">
                <h1> <?php echo __("Wähle eine Datei für den Produkte-Import", "fcplugin"); ?> </h1>
                <ul>
                  <li> <?php echo __("Akzeptierte Formate: XLSX", "fcplugin"); ?> </li>
                  <li> <?php echo __("Wie muss die Import Liste aussehen?", "fcplugin"); ?> <a href="https://plugin.pot.ch/dokumentation/administration/produkte/" target="_blank"><?php echo __("Anleitung", "fcplugin"); ?> </a> </li>  
                  <li> <?php echo __("Produkte-Matching zwischen vorhandenen Produkten und der Import-Liste erfolgt aufgrund der Spalten", "fcplugin"); ?> <code>'id'</code> <?php echo __("oder", "fcplugin"); ?> <code>'pot_id'</code> </li>
                  <li> <?php echo __("Kategorien, die noch nicht erfasst sind, werden erstellt", "fcplugin"); ?> </li>
                  <li> <?php echo __("Zellen dürfen nicht leer sein, ausser:", "fcplugin"); ?><br /> <code>'id'</code> <code>'short_description'</code> <code>'image'</code> <code>'description'</code> <code>'sku'</code> <code>'tax'</code> <code>'pot_id'</code> </li>
                </ul>
              </div>

              <div class="foodcoop_file_import_content_action">
                <input type="file" id="foodcoop_file_import_file">
              </div>

              <div class="foodcoop_file_import_content_next">
              <div class="wp-admin waiting hidden">
                  <img src="<?php echo parse_url(admin_url())['path'].'images/spinner.gif'; ?>" alt="Loading...">
              </div>
                <button type="submit" id="foodcoop_product_import_step1-submit" class="button button-primary"><?php echo __("Fortfahren mit den Einstellungen", "fcplugin"); ?></button>
              </div>

            </form>
          <?php 
          } 

          if ($active_step === 2 && $is_error === false) { 
          ?>

            <form id="foodcoop_product_import_step2">
            
              <div class="foodcoop_file_import_content_header">
                <h1> <?php echo __("Einstellungen für den Produkte-Import", "fcplugin"); ?> </h1>
              </div>

              <div class="foodcoop_file_import_content_action">
                <table class="foodcoop_file_import_settings-table">
                  <tr>
                    <td><input type="checkbox" id="foodcoop_product_import_delete" name="foodcoop_product_import_delete"></td>
                    <td>
                      <label for="foodcoop_product_import_delete"><?php echo __("Produkte löschen, die nicht in der Import-Liste vorhanden sind?", "fcplugin"); ?></label>
                      <small><?php echo __("Betrifft Produkte, die aktuell in der WordPress Datenbank erfasst sind, aber nicht mittels Import überschrieben werden. Du kannst diese behalten oder löschen lassen.", "fcplugin"); ?></small>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="foodcoop_file_import_content_next">
              <div class="wp-admin waiting hidden">
                  <img src="<?php echo parse_url(admin_url())['path'].'images/spinner.gif'; ?>" alt="Loading...">
              </div>
                <input type="hidden" id="foodcoop_file_import_file" value="<?php echo $file_path; ?>" />
                <button type="submit" id="foodcoop_product_import_step2-submit" class="button button-primary"><?php echo __("Fortfahren mit der Dateiüberprüfung", "fcplugin"); ?></button>
              </div>

            </form>
          <?php 
          }
          
          if ($active_step === 3 && $is_error === false) { 
            ?>

              <form id="foodcoop_product_import_step3">
              
                <div class="foodcoop_file_import_content_header">
                  <h1> <?php echo __("Produkte importieren", "fcplugin"); ?> </h1>

                  <?php
                    if (count($formatting_errors) > 0) { 
                      ?>
                        <p> <?php echo __("Es wurden Fehler in der Datei gefunden. Die Zeilen mit Fehlern sind unten rot markiert.", "fcplugin"); ?> </p>
                        <ul>
                        <?php
                          foreach ($formatting_errors as $error) { 
                            ?>
                              <li> <?php echo "Zeile ".$error[0].": ".$error[1]; ?> </li>
                            <?php
                          }
                        ?>
                        </ul>
                      <?php
                    } else {
                      ?>
                        <p> <?php echo __("Die Datei wurde geprüft und ist bereit für den Import. Du kannst hier alle Zeilen überprüfen und dann mit dem Import fortfahren.", "fcplugin"); ?> </p>
                      <?php
                        if ($foodcoop_product_import_delete === "true") {
                        ?>
                          <p><strong> <?php echo __("Achtung: Alle Produkte, die nicht in der Import-Liste sind, werden gelöscht!", "fcplugin"); ?> </strong></p>
                        <?php
                        }
                    }
                  ?>
                </div>

                <?php 
                if (count($data) > 0) {

                ?>
                <div class="foodcoop_file_import_content_action">
                  <table class="foodcoop_file_import_settings-table">
                    <?php
                      $i = 0;
                      foreach ($data as $product) { 
                        $row_nr = $i + 1;
                        $row_has_error = false;
                        if (in_array($row_nr, $rows_with_errors)) $row_has_error = true;
                      ?>
                        <tr <?php if ($row_has_error) echo "style='background-image: linear-gradient(45deg, #ffbfbf 25%, #ffcccc 25%, #ffcccc 50%, #ffbfbf 50%, #ffbfbf 75%, #ffcccc 75%, #ffcccc 100%);background-size: 28.28px 28.28px;border-bottom:1px solid #ffcccc'"; ?>>
                          <td> <?php if ($i !== 0) echo $i; ?> </td>
                          <td> <?php echo $product[7]; ?> </td>
                          <td> <?php echo $product[11]; ?> </td>
                          <td> <?php echo $product[0]; ?> </td>
                          <td> <?php echo $product[1]; ?> </td>
                          <td> <?php echo $product[6]; ?> </td>
                          <td> <?php echo $product[4]; ?> </td>
                          <td> <?php echo $product[12]; ?> </td>
                        </tr>
                      <?php
                        $i++;
                      }
                    ?>
                  </table>
                </div>
                <?php } ?>

                <div class="foodcoop_file_import_content_next">
                  <input type="hidden" id="foodcoop_product_import_delete" value="<?php echo $foodcoop_product_import_delete; ?>" />
                  <input type="hidden" id="foodcoop_product_import_file" value="<?php echo $file_path; ?>" />
                  <div id="foodcoop_product_import_progress"></div>
                  <input type="hidden" id="foodcoop_file_import_file" value="<?php echo $_GET['file']; ?>" />
                  <?php count($formatting_errors) > 0 ? $disabled = false : $disabled = true; ?>
                  <?php if (!$disabled) {
                  ?>
                  <a class="button button-secondary" href="<?php echo parse_url(admin_url())['path'].'admin.php?page=foodcoop-product-import'; ?>" ><?php echo __("Import neu beginnen", "fcplugin"); ?> </a>
                  <?php 
                  } else {
                  ?>
                  <button type="submit" id="foodcoop_product_import_step3-submit" class="button button-primary"><?php echo __("Fortfahren mit dem Import", "fcplugin"); ?></button>
                  <?php } ?>
                </div>

              </form>
            <?php 
          }
          ?>

          <!-- 
            / Step Content
          -->

          <?php
          if ($active_step === 4 && $is_error === false) { 
            $totalproducts = $_GET['updatedproducts'] + $_GET['newproducts'];
            $updatedproducts = $_GET['updatedproducts'];
            $newproducts = $_GET['newproducts'];
            ?>

            <form id="foodcoop_product_import_step1">
            
              <div class="foodcoop_file_import_content_header">
                <h1> <?php echo $totalproducts." ".__("Produkte wurden importiert", "fcplugin"); ?> </h1>
                <ul>
                  <li> <?php echo $newproducts." ".__("Produkte wurden neu erstellt", "fcplugin"); ?> </li>
                  <li> <?php echo $updatedproducts." ".__("Produkte wurden aktualisiert", "fcplugin"); ?> </li>  
                </ul>
              </div>

              <div class="foodcoop_file_import_content_next">
                <a href="<?php echo parse_url(admin_url())['path'].'admin.php?page=foodcoop-plugin'; ?>" class="button button-primary"><?php echo __("Zurück zum POT Plugin", "fcplugin"); ?></a>
              </div>

            </form>
          <?php 
          }
          ?> 

        </div>
      </div>

    </div>
  <?php }

}