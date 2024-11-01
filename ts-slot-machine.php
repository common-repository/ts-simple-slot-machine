<?php
/**
 * Plugin Name: TS Simple Slot Machine
 * Description: Plugin that gives you a slot machine on the site.
 * Version: 1.0
 * Author: Tero Sarparanta
 * Author URI: https://profiles.wordpress.org/tero2000
 * License: WTFPL
*/

if ( ! defined( 'ABSPATH' ) ) exit;

// Load Styles
function ts_slot_machine_backend_styles() {

 wp_enqueue_style( 'slot_machine_css', plugins_url( 'ts-slot-machine.css', __FILE__ ) );

}
add_action( 'admin_head', 'ts_slot_machine_backend_styles' );

function ts_slot_machine_frontend_scripts_and_styles() {

 wp_enqueue_style( 'slot_machine_css', plugins_url( 'ts-slot-machine.css', __FILE__ ) );
 wp_enqueue_script( 'slot_machine_js', plugins_url( 'ts-slot-machine.js', __FILE__ ), array('jquery'), '', true );

}
add_action( 'wp_enqueue_scripts', 'ts_slot_machine_frontend_scripts_and_styles' );
/* Styles loaded brotha */


// Create new shortcode option.
add_shortcode( 'slot-machine', 'ts_slot_machine_shortcode' );

// Execute the shortcode
function ts_slot_machine_shortcode( $atts ) {

  $html  = '<div id="slot-machine" style="margin-top: 30px; margin-bottom: 30px;">';
  $html .= '<h2 style="text-align: center; color: #22313F;">Food Slot</h2><p style="text-align: center; margin-bottom: 30px; color: #336E7B;">Decide what to eat today!</p>';
  $html .= '<div class="content container" style="text-align: center;max-width: 700px;">';
  $html .= '<div class="row"><div class="col-4">';
  $html .= '<div><div id="machine1" class="randomizeMachine">';
  $html .= '<div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot1.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot2.png" />';
  $html .= '</div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot3.png" /></div><div>';
  $html .= '<img src="' . plugin_dir_url( __FILE__ ) . 'img/slot4.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot5.png" />';
  $html .= '</div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot6.png" /></div></div></div></div>';
  $html .= '<div class="col-4"><div><div id="machine2" class="randomizeMachine">';
  $html .= '<div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot1.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot2.png" />';
  $html .= '</div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot3.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot4.png" />';
  $html .= '</div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot5.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot6.png" />';
  $html .= '</div></div></div></div><div class="col-4"><div><div id="machine3" class="randomizeMachine"><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot1.png" /></div><div>';
  $html .= '<img src="' . plugin_dir_url( __FILE__ ) . 'img/slot2.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot3.png" />';
  $html .= '</div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot4.png" /></div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot5.png" />';
  $html .= '</div><div><img src="' . plugin_dir_url( __FILE__ ) . 'img/slot6.png" /></div></div></div>';
  $html .= '</div></div><div>';
  $html .= '<div id="startSlot">Shuffle</div>';
  $html .= '</div></div></div>';

 return $html;
}
