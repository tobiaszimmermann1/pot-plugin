<?php
    //Include the wp-load.php file
    include('wp-load.php');
    //As this is external file, we aren't using the WP theme here. So setting this as false
    define('WP_USE_THEMES', false);

		$logo = esc_url( wp_get_attachment_image_src( get_theme_mod( 'custom_logo' ), 'full' )[0] );
		if (!$logo) {
			$logo = __DIR__ . '/../../images/foodcoop-icon.svg';
		}
?>

<!DOCTYPE html>

<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<title></title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"/><!--<![endif]-->
<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		@media (max-width:670px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>
<body style="background-color: #f0f0f0; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
<table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0; background-size: auto; background-image: none; background-position: top left; background-repeat: no-repeat;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<div class="spacer_block block-2" style="height:50px;line-height:50px;font-size:1px;"> </div>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; background-size: auto; color: #000; width: 650px; margin: 0 auto;" width="650">
<tbody>
<tr>
<td class="column column-1" style="font-weight: 400; text-align: left; mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="10" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td class="pad">
<h1 style="margin: 0; color: #00796b; direction: ltr; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Willkommen an Bord!</span></h1>
</td>
</tr>
</table>
<div class="spacer_block block-2" style="height:30px;line-height:30px;font-size:1px;"> </div>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:30px;padding-top:10px;">
<div style="color:#000000;direction:ltr;font-family:'Roboto', Tahoma, Verdana, Segoe, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:24px;">
<p style="margin: 0; margin-bottom: 16px;">Du bekommst diese E-Mail, weil du dich bei <?php echo get_option('blogname'); ?> angemeldet hast. Wir freuen uns riesig dich mit an Bord zu haben. Hier erfährst du die nächsten Schritte.</p>
<p style="margin: 0; margin-bottom: 16px;">Es ist unsere Mission dir die besten Lebensmittel möglichst ohne Zwischenhandel, also direkt vom Produzenten / der Produzentin, zugänglich zu machen. Gemeinsam schaffen wir so mehr Unabhängigkeit von grossen Konzernen, faire Zusammenarbeit mit der Landwirtschaft und mehr Kontrolle darüber was auf unseren Tellern landet.</p>
<p style="margin: 0;">Wir haben dir bereits ein Konto erstellt. Du kannst dich bequem einloggen, indem du unsere <a href="<?php echo home_url(); ?>"><strong>Webseite</strong></a> besuchst. Bitte nutze für das Login folgende Angaben: </p>
</div>
</td>
</tr>
</table><!--[if mso]><style>#list-r1c0m3 ul{margin: 0 !important; padding: 0 !important;} #list-r1c0m3 ul li{mso-special-format: bullet;}#list-r1c0m3 .levelOne li {margin-top: 0 !important;} #list-r1c0m3 .levelOne {margin-left: -20px !important;}#list-r1c0m3 .levelTwo li {margin-top: 0 !important;} #list-r1c0m3 .levelTwo {margin-left: 10px !important;}#list-r1c0m3 .levelThree li {margin-top: 0 !important;} #list-r1c0m3 .levelThree {margin-left: 40px !important;}#list-r1c0m3 .levelFour li {margin-top: 0 !important;} #list-r1c0m3 .levelFour {margin-left: 70px !important;}#list-r1c0m3 .levelFive li {margin-top: 0 !important;} #list-r1c0m3 .levelFive {margin-left: 100px !important;}#list-r1c0m3 .levelSix li {margin-top: 0 !important;} #list-r1c0m3 .levelSix {margin-left: 130px !important;}#list-r1c0m3 .levelSeven li {margin-top: 0 !important;} #list-r1c0m3 .levelSeven {margin-left: 160px !important;}#list-r1c0m3 .levelEight li {margin-top: 0 !important;} #list-r1c0m3 .levelEight {margin-left: 190px !important;}#list-r1c0m3 .levelNine li {margin-top: 0 !important;} #list-r1c0m3 .levelNine {margin-left: 220px !important;}</style><![endif]-->