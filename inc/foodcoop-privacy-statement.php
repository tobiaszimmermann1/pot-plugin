<?php
  /**
   * Privacy statement
   * version: 1.0
   * date: 19.11.24
   * author: Tobias Zimmermann
   * options: mailchimp, recaptcha, twint, fontawesome 
   */

  $woocommerce_store_address = get_option('woocommerce_store_address');
  $woocommerce_store_city = get_option('woocommerce_store_city');
  $woocommerce_store_postcode = get_option('woocommerce_store_postcode');
  $blogname = get_option('blogname');
  $privacy = json_decode(get_option('fc_privacy'));
?>

<h1>Datenschutzerklärung von <?php echo $blogname; ?></h1>

<h3>1. Datenschutzerklärung</h3>
<p>
  Wir bearbeiten Personendaten im Einklang mit dem schweizerischen Datenschutzrecht wie insbesondere dem Bundesgesetz über den Datenschutz (Datenschutzgesetz, DSG) und der Verordnung über den Datenschutz (Datenschutzverordnung, DSV).
</p>

<h3>2. Verantwortlicher für die Datenbearbeitung</h3>
<p>
  Verantwortlicher für die Datenbearbeitung auf dieser Website und Ansprechpartner für Datenschutzanliegen ist:
</p>
<p>
<?php echo $blogname; ?><br/>
<?php echo $woocommerce_store_address; ?><br/>
<?php echo $woocommerce_store_postcode.' '.$woocommerce_store_city; ?><br/>
<?php echo get_option('admin_email'); ?><br/>
</p>

<h3>3. Datenerfassung auf dieser Website</h3>

  <h4>3.1 Logfiles</h4>
  <p>
    Unsere Website wird von Metanet AG (Josefstrasse 218, 8005 Zürich, Switzerland) gehostet. 
  </p>
  <p>
    Zur Optimierung und Aufrechterhaltung unserer Website protokollieren wir technische Fehler, die beim Aufrufen unserer Website allenfalls auftreten. Ferner werden bei der Nutzung dieser Website automatisch Informationen erhoben, die der Browser Ihres Endgeräts an unseren Host-Provider übermittelt. Dies sind:
  </p>
  <p>
    <ul>
      <li>IP-Adresse und Betriebssystem Ihres Endgeräts</li>
      <li>Browsertyp, Version, Sprache</li>
      <li>Datum und Uhrzeit der Serveranfrage</li>
      <li>aufgerufene Datei</li>
      <li>die Website, von der aus der Zugriff erfolgte (Referrer URL)</li>
      <li>den Status-Code (z.B. 404)</li>
      <li>das verwendete Übertragungsprotokoll (z.B. HTTP/2)</li>
    </ul>
  </p>

  <h4>3.2 Kontaktformular</h4>
  <p>
    Wenn Sie unser Kontaktformular benutzen, werden Ihre Angaben aus dem Anfrageformular zur Bearbeitung der Anfrage und für den Fall von Anschlussfragen von uns bearbeitet. In der Regel benötigen wir folgende Angaben:
    <ul>
      <li>Name</li>
      <li>Email</li>
      <li>Adresse</li>
      <li>Telefon</li>
      <li>Nachrichteninhalt, sowie weitere für die Anfrage relevante Informationen</li>
    </ul>
  </p>

  <h4>3.3 Cookies</h4>
  <p>
    Unsere Website nutzt WordPress und WooCommerce als technische Grundlage. Diese Dienste nutzen Cookies, um das korrekte Funktionieren unserer Website sicherzustellen. Die gesetzten Cookies betreffen drei funktionale Kategorien:
    <ul>
      <li>Authentifizierung</li>
      <li>Persönliche Einstellungen</li>
      <li>E-Commerce Funktionen wie Warenkorb, Kasse, etc.</li>
    </ul>
    Externe Dienste können weitere Cookies (insbesondere für Analyse und Tracking) setzen. Diese Dienste sind unter Punkt 4 separat gelistet.
  </p>

  <h4>3.5 Registrierung</h4>
  <p>
    Wenn Sie auf unserer Webseite ein Konto haben, werden die von Ihnen eingegebenen Informationen gespeichert. Wir erfassen folgende Angaben:
    <ul>
      <li>Name</li>
      <li>Email</li>
      <li>Adresse</li>
      <li>Telefon</li>
    </ul>
    Diese Daten sind für die Nutzung unseres Angebots essentiell und werden ausschliesslich deshalb erfasst.
  </p>


<h3>4. Externe Dienste</h3>

  <?php 
    if ($privacy->privacyMailchimp == false && $privacy->privacyRecaptcha == false && $privacy->privacyFontawesome == false && $privacy->privacyTwint == false) echo "<p>Unsere Website nutzt keine externe Dienste.</p>";
  ?>

  <?php 
    if ($privacy->privacyMailchimp == true) {
      ?>
        <h4>Mailchimp</h4>
        <p>
          Für den Versand von Newslettern und E-Mail-Benachrichtigungen nutzen wir den Dienst MailChimp, angeboten von Intuit Inc. (USA). Wenn Sie sich für unseren Newsletter anmelden, werden die von Ihnen angegebenen Daten und Ihre E-Mail-Adresse an MailChimp übertragen, gespeichert und verarbeitet. Dies ermöglicht uns, Ihnen regelmässige Updates, Angebote und Informationen zuzusenden. Durch die Anmeldung zum Newsletter werden Ihre IP-Adresse und das Datum der Anmeldung gespeichert. Diese Speicherung dient allein dem Nachweis im Fall, dass ein Dritter eine E-Mail-Adresse missbraucht und sich ohne Wissen des Berechtigten für den Newsletterempfang anmeldet. MailChimp bietet umfangreiche Analysemöglichkeiten darüber, wie die versendeten Newsletter geöffnet und benutzt werden. Diese Analysen sind gruppenbezogen und werden von uns nicht zur individuellen Auswertung verwendet. Die bei MailChimp gespeicherten Daten werden gelöscht, sobald Sie sich von unserem Newsletter abmelden. Dies beeinträchtigt nicht Daten, die zu anderen Zwecken bei uns gespeichert sind. MailChimp hat eigene Datenschutzrichtlinien und -praktiken, die sich von denen unserer Website unterscheiden können. Weitere Informationen zum Datenschutz bei MailChimp finden Sie unter: https://mailchimp.com/legal/privacy/. Wenn Sie Fragen zu den von MailChimp erfassten Daten haben oder Ihre Rechte in Bezug auf diese Daten ausüben möchten, sollten Sie sich direkt an Intuit Inc. wenden. <a href="https://www.intuit.com/privacy/statement/" target="_blank">Mehr Informationen</a>
        </p>
      <?php
    }
  ?>

  <?php 
    if ($privacy->privacyRecaptcha == true) {
      ?>
        <h4>Google reCaptcha</h4>
        <p>
          Unsere Website nutzt reCaptcha von Google, um unsere Formulare vor Spam zu schützen. <a href="https://developers.google.com/recaptcha?hl=de" target="_blank">Mehr Informationen</a>
        </p>
      <?php
    }
  ?>

  <?php 
    if ($privacy->privacyFontawesome == true) {
      ?>
        <h4>FontAwesome</h4>
        <p>
          Unsere Website nutzt FontAwesome von Fonticons Inc. (USA), um Icons darzustellen. <a href="https://fontawesome.com/privacy" target="_blank">Mehr Informationen</a>
        </p>
      <?php
    }
  ?>

  <?php 
    if ($privacy->privacyTwint == true) {
      ?>
        <h4>Google reCaptcha</h4>
        <p>
          Unsere Website bietet Zahlungen per Twint an. Twint AG nutzt personenbezogene Daten, um Zahlungen abzuwickeln. <a href="https://www.twint.ch/datenschutz/" target="_blank">Mehr Informationen</a>
        </p>
      <?php
    }
  ?>


<h3>5. Links</h3>
  <p>
    Auf unserer Website finden Sie Links auf Seiten von Drittanbietern. Wir sind nicht verantwortlich für die Inhalte und Datenschutzvorkehrungen auf externen Websites, welche Sie über die Links erreichen können. Bitte informieren Sie sich über den Datenschutz direkt auf den entsprechenden Websites.
  </p>


<h3>6. Weitergabe von Daten an Dritte</h3>
  <p>
    Wir geben grundsätzlich keine Daten an Dritte weiter (Ausnahmen können unter Punkt 4 "Externe Dienste" explizit erwähnt sein). Es ist möglich, dass technische Dienstleister im Rahmen von Wartungsarbeiten, Entwicklung und technischem Support Einsicht in die Datenbank der Website haben. 
  </p>


<h3>7. Ihre Rechte</h3>
  <p>
    Betroffene Personen haben jederzeit das Recht auf Auskunft darüber ob und welche Daten wir über sie erfasst haben und auf Löschung von persönlichen Daten.
  </p>