-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2026 at 12:03 PM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `walls`
--

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_categories`
--

CREATE TABLE `hdwallsite_categories` (
  `catid` int(11) NOT NULL,
  `parentid` int(11) NOT NULL DEFAULT 1,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `page_title` varchar(200) DEFAULT NULL,
  `page_description` text DEFAULT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `total_wallpapers` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_categories`
--

INSERT INTO `hdwallsite_categories` (`catid`, `parentid`, `slug`, `name`, `page_title`, `page_description`, `meta_title`, `meta_description`, `meta_keywords`, `total_wallpapers`) VALUES
(1, 0, NULL, '[TOP]', NULL, NULL, NULL, NULL, NULL, 0),
(2, 1, '/3d-abstract', '3D & Abstract', '3D and Abstract | HD | Widescreen Wallpapers for Laptops and Smartphones', '3D and Abstract Wallpapers Collection in HD and Widescreen Resolutions.Available for Laptops,Desktops,Smartphones and Smart UHD TV\'s.', '3D and Abstract | HD | Widescreen Wallpapers for Laptops and Smartphones', '3D and Abstract Wallpapers Collection in HD and Widescreen Resolutions.Available for Laptops,Desktops,Smartphones and Smart UHD TV\'s.', '3d,abstract,3d and abstract,hdtv,smartphone,uhd,hd,widescreen,wallpapers', 0);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs`
--

CREATE TABLE `hdwallsite_configs` (
  `id` int(11) NOT NULL,
  `param` varchar(255) NOT NULL,
  `value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs`
--

INSERT INTO `hdwallsite_configs` (`id`, `param`, `value`) VALUES
(1, 'backend_theme', 'admin'),
(2, 'cats_show_empty_sidebar', '1'),
(3, 'cronjob_next_index', '1463929825'),
(4, 'cronjob_password', 'q20uwou3ui'),
(5, 'cronjob_type', 'server'),
(6, 'default_license_id', '25'),
(7, 'down_for_maintenance', '0'),
(8, 'email_contact', 'admin@phpwallpaperscript.com'),
(9, 'email_from_name', 'HD Wallpapers Contact'),
(10, 'email_reply_to', 'no-reply@phpwallpaperscript.com'),
(11, 'frontend_theme', 'default'),
(12, 'installed_modules', '[\"admanager\",\"linkmanager\",\"linkmanager\"]'),
(13, 'preview_height', '270'),
(14, 'preview_type', '3'),
(15, 'preview_width', '480'),
(16, 'routes_language', 'en'),
(17, 'rss_limit', '25'),
(18, 'system_language', 'en'),
(19, 'thumb_height', '135'),
(20, 'thumb_type', '3'),
(21, 'thumb_width', '240'),
(22, 'users_avatar_height', '70'),
(23, 'users_avatar_width', '70'),
(24, 'users_can_post_wall_comm', '1'),
(25, 'users_can_register', '1'),
(26, 'users_can_submit_walls', '1'),
(27, 'users_default_role_id', '2'),
(28, 'users_members_per_page', '16'),
(29, 'users_moderated_comments', '1'),
(30, 'users_register_confirmation', '1'),
(31, 'users_restricted_usernames', 'admin,administration,adm,wallpaper,wallpapers,porn,porntube,sexy,sex,porns,pornmovies,viagra,cialis,pula,fuck,fuckoff,bitch,asshole,ass,pussy,hdwalls,hdwallpapers,wallpapers,hd'),
(32, 'use_image_preview_route', '1'),
(33, 'use_image_thumb_route', '1'),
(34, 'wall_featured_records', '3'),
(35, 'wall_home_show_pagination', '1'),
(36, 'wall_max_related', '3'),
(37, 'wall_moderate_submit', '1'),
(38, 'wall_records_per_page', '15'),
(39, 'wall_resolutions_page_records', '3'),
(40, 'website_language', 'en'),
(41, 'mobile_theme', NULL),
(42, 'resolutions_show_empty_sidebar', '1'),
(44, 'frontend_theme_options', NULL),
(45, 'wall_featured_total', '0');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_emails`
--

CREATE TABLE `hdwallsite_configs_emails` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('template','content') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_emails`
--

INSERT INTO `hdwallsite_configs_emails` (`id`, `name`, `type`) VALUES
(1, '_template', 'template'),
(2, '_signature', 'template'),
(3, 'contact_admin_receive', 'content'),
(4, 'new_password_request', 'content'),
(5, 'registration_confirmation', 'content'),
(6, 'registration_welcome', 'content'),
(7, 'wallpaper_activation', 'content'),
(8, 'wallpaper_disable', 'content'),
(9, 'wallpaper_rejection', 'content');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_emails_t`
--

CREATE TABLE `hdwallsite_configs_emails_t` (
  `id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  `email_id` int(11) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `from_email` varchar(255) DEFAULT NULL,
  `from_name` varchar(255) DEFAULT NULL,
  `reply_to` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_emails_t`
--

INSERT INTO `hdwallsite_configs_emails_t` (`id`, `language_id`, `email_id`, `subject`, `content`, `from_email`, `from_name`, `reply_to`) VALUES
(1, 1, 1, NULL, '<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\r\n<html>\r\n<head>\r\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n    <title>New E-Mail</title>\r\n</head>\r\n<body>\r\n{content}<br />\r\n{signature}<br />\r\n</body>\r\n</html>', NULL, NULL, NULL),
(2, 1, 2, NULL, '<br><br>\r\nSincerely,<br>\r\n{sitename}<br>\r\n<a href=\"{siteurl}\">{siteurl}</a>', NULL, NULL, NULL),
(3, 1, 3, 'Message from contact page', 'Subject: {subject}<br />\r\nEmail: {email}<br />\r\nName: {name}<br />\r\nWebsite: {website}<br />\r\nDate: {date}<br />\r\nIP: {ip}<br />\r\n<hr><br />\r\n{message}', NULL, NULL, NULL),
(4, 1, 4, 'Password Recovery', 'Dear {username},<br />\r\n<br />\r\nOn {date} you have requested a new password from our password recovery form. <br />\r\n<br />\r\nNew auto-generated password is: {newpassword}<br />\r\n<br />\r\nTo confirm your password changes on {sitename} go to:<br />\r\n<a href=\"{confirmurl}\">{confirmurl}</a>\r\n<br />', NULL, NULL, NULL),
(5, 1, 5, 'Registration Confirmation', 'Welcome {username},<br />\r\n<br />\r\nWe are pleased to have you on board.<br />\r\n<br />\r\nTo activate your account on {siteurl} go to:<br />\r\n<a href=\"{confirmurl}\">{confirmurl}</a>\r\n<br />', NULL, NULL, NULL),
(6, 1, 6, 'Welcome on {sitename}', 'Welcome {username},<br />\r\n<br />\r\nWe are pleased to have you on board.<br />', NULL, NULL, NULL),
(7, 1, 7, 'Wallpaper Activated', 'Dear {username},<br /><br />\r\nWallpaper named <b>{wallpapername}</b> and published on {sitename} was activated on {date}', NULL, NULL, NULL),
(8, 1, 8, 'Your wallpaper was disabled', 'Dear {username},<br /><br />\r\nWallpaper named <b>{wallpapername}</b> and published on {sitename} was disabled on {date}', NULL, NULL, NULL),
(9, 1, 9, 'Your wallpaper was rejected', 'Dear {username},<br /><br />\r\nWallpaper named <b>{wallpapername}</b> and published on {sitename} was rejected on {date}', NULL, NULL, NULL),
(10, 2, 3, 'Mesaj din pagina de contact', 'Subiect: {subject}<br />\r\nEmail: {email}<br />\r\nNume: {name}<br />\r\nWebsite: {website}<br />\r\nData: {date}<br />\r\nIP: {ip}<br />\r\n<hr><br />\r\n{message}', NULL, NULL, NULL),
(11, 2, 1, NULL, '<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\r\n<html>\r\n<head>	\r\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n    <title>E-Mail Nou</title>\r\n</head>\r\n<body><br />\r\n{content}<br />\r\n{signature}<br />\r\n</body>\r\n</html>\r\n', NULL, NULL, NULL),
(12, 2, 2, NULL, 'Cu drag,<br />\r\n{sitename}<br />\r\n<a href=\"{siteurl}\">{siteurl}</a>', NULL, NULL, NULL),
(13, 2, 4, 'Recuperare Parola', 'Salut {username},<br />\r\n<br />\r\nIn data {date} ai solicitat o noua parola din sectiunea recuperare parola. <br />\r\n<br />\r\nNoua parola generata automat este: {newpassword}<br />\r\n<br />\r\nPentru a confirma modificarile click aici:<br />\r\n<a href=\"{confirmurl}\">{confirmurl}</a><br />\r\n', NULL, NULL, NULL),
(14, 2, 5, 'Confirmare Inregistrare', 'Salut {username},<br />\r\n<br />\r\nBine ai venit pe {sitename}.<br />\r\n<br />\r\nPentru a-ti activa contul de pe {siteurl} click aici:<br />\r\n<a href=\"{confirmurl}\">{confirmurl}</a><br />\r\n', NULL, NULL, NULL),
(15, 2, 6, 'Bine ai venit pe {sitename}.', 'Salut {username},<br />\r\n<br />\r\nBine ai venit pe {sitename}.', NULL, NULL, NULL),
(16, 2, 7, 'Wallpaperul tau a fost activat', 'Salut {username},<br />\r\n<br />\r\nWallpaperul tau (<b>{wallpapername}</b>) publicat pe {sitename} a fost activat in data de {date}.', NULL, NULL, NULL),
(17, 2, 8, 'Wallpaperul tau a fost dezactivat', 'Salut {username},<br />\r\n<br />\r\nWallpaperul tau (<b>{wallpapername}</b>) publicat pe {sitename} a fost dezactivat in data de {date}.', NULL, NULL, NULL),
(18, 2, 9, 'Wallpaperul tau a fost respins', 'Salut {username},<br />\r\n<br />\r\nWallpaperul tau (<b>{wallpapername}</b>) publicat pe {sitename} a fost respins in data de {date}.', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_lang`
--

CREATE TABLE `hdwallsite_configs_lang` (
  `langid` int(11) NOT NULL,
  `param` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_lang`
--

INSERT INTO `hdwallsite_configs_lang` (`langid`, `param`, `name`, `status`, `is_primary`) VALUES
(1, 'en', 'English', 'active', 1),
(2, 'ro', 'Română', 'inactive', 0);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_lang_p`
--

CREATE TABLE `hdwallsite_configs_lang_p` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `param` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_lang_p`
--

INSERT INTO `hdwallsite_configs_lang_p` (`id`, `section_id`, `param`) VALUES
(1, 1, 'sitename'),
(2, 1, 'meta_title_suffix'),
(3, 1, 'home_meta_title'),
(4, 1, 'home_meta_description'),
(5, 1, 'home_meta_keywords'),
(6, 1, 'home'),
(7, 1, 'browse'),
(8, 1, 'tagcloud'),
(9, 1, 'tagcloud_meta_title'),
(10, 1, 'tagcloud_meta_description'),
(11, 1, 'tagcloud_meta_keywords'),
(12, 1, 'community'),
(13, 1, 'submit'),
(14, 1, 'advsearch'),
(15, 1, 'searchforwalls'),
(16, 1, 'admin'),
(17, 1, 'current_location'),
(18, 1, 'rssfeeds'),
(19, 1, 'contact'),
(20, 1, 'sitemap'),
(21, 1, 'copyright'),
(22, 1, 'poweredby'),
(23, 1, 'latestwalls'),
(24, 1, 'popwalls'),
(25, 1, 'dwnlwalls'),
(26, 1, 'favwalls'),
(27, 1, 'ratedwalls'),
(28, 1, 'categories'),
(29, 1, 'resolutions'),
(30, 1, 'your_resolution_is'),
(31, 1, 'applyglobalfilter'),
(32, 1, 'unsetglobalfilter'),
(33, 1, 'globalfilter'),
(34, 1, 'global_filter_is'),
(35, 1, 'login'),
(36, 1, 'logout'),
(37, 1, 'signup'),
(38, 1, '404_title'),
(39, 1, '404_text'),
(40, 1, 'member_login'),
(41, 1, 'no_account'),
(42, 1, 'forgot_password'),
(43, 1, 'label_username'),
(44, 1, 'label_username_r'),
(45, 1, 'label_email'),
(46, 1, 'label_password'),
(47, 1, 'label_rpassword'),
(48, 1, 'label_rememberme'),
(49, 1, 'label_securitycode'),
(50, 1, 'btnlogin'),
(51, 1, 'btnsendpwd'),
(52, 1, 'register_meta_title'),
(53, 1, 'register'),
(54, 1, 'register_na'),
(55, 1, 'login_meta_title'),
(56, 1, 'forgotpwd_meta_title'),
(57, 1, 'users_cannot_register'),
(58, 1, 'menu_submit'),
(59, 1, 'menu_my_walls'),
(61, 1, 'menu_settings'),
(62, 1, 'hello_user'),
(63, 1, 'featuredwalls'),
(64, 1, 'submitwalls'),
(65, 1, 'submitpack'),
(66, 1, 'submitimages'),
(67, 1, 'submitcompatible'),
(68, 1, 'viewresolutions'),
(69, 1, 'packsubmitinfo'),
(70, 1, 'submitdetails'),
(71, 1, 'compat_name'),
(72, 1, 'compat_type'),
(73, 1, 'compat_width'),
(74, 1, 'compat_height'),
(75, 1, 'are_you_sure'),
(76, 1, 'nowalls'),
(77, 1, 'date_uploaded'),
(78, 1, 'date_uploaded_format'),
(79, 1, 'wall_category'),
(80, 1, 'wall_added_by'),
(81, 1, 'wall_license'),
(82, 1, 'wall_statistics'),
(83, 1, 'wall_av_resolutions'),
(84, 1, 'wall_res_view_title'),
(85, 1, 'wall_tags'),
(86, 1, 'wall_meta_title'),
(87, 1, 'wall_meta_description'),
(88, 1, 'wall_meta_keywords'),
(89, 1, 'wall_related'),
(90, 1, 'registration_confirmation'),
(91, 1, 'registration_confirmation_failed'),
(92, 1, 'registration_confirmation_ok'),
(93, 1, 'error_empty_username'),
(94, 1, 'error_empty_password'),
(95, 1, 'error_invalid_login'),
(96, 1, 'error_status_pending'),
(97, 1, 'error_status_suspended'),
(98, 1, 'error_status_closed'),
(99, 1, 'error_login_unable'),
(100, 1, 'error_empty_captcha'),
(101, 1, 'error_invalid_captcha'),
(102, 1, 'error_empty_username_register'),
(103, 1, 'error_username_not_alphadash'),
(104, 1, 'error_username_exists'),
(105, 1, 'error_email_required'),
(106, 1, 'error_email_invalid'),
(107, 1, 'error_email_exists'),
(108, 1, 'error_email_na'),
(109, 1, 'error_password_required'),
(110, 1, 'error_password_not_alphadash'),
(111, 1, 'error_rpassword_required'),
(112, 1, 'error_passwords_no_match'),
(113, 1, 'error_registration_failed'),
(114, 1, 'error_new_password_failed'),
(115, 1, 'error_password_recovery_invalid_key'),
(116, 1, 'error_password_recovery_unable_to_save_new_pwd'),
(117, 1, 'error_login_to_submit'),
(118, 1, 'error_no_images'),
(119, 1, 'error_resolution_type_na'),
(120, 1, 'error_upload_not_image'),
(121, 1, 'error_no_archive'),
(122, 1, 'error_zip_unable_open'),
(123, 1, 'error_unable_to_perform'),
(124, 1, 'error_wallpaper_title_required'),
(125, 1, 'error_wallpaper_title_too_small'),
(126, 1, 'error_wallpaper_cat_required'),
(127, 1, 'error_wallpaper_license_required'),
(128, 1, 'error_wallpaper_cat_invalid'),
(129, 1, 'error_wallpaper_license_invalid'),
(130, 1, 'error_wallpaper_author_name_too_small'),
(131, 1, 'error_wallpaper_author_website_invalid'),
(132, 1, 'error_wallpaper_description_too_small'),
(133, 1, 'error_wallpaper_tags_item_too_small'),
(134, 1, 'error_wallpaper_meta_title_too_small'),
(135, 1, 'error_wallpaper_date_to_publish_lower'),
(136, 1, 'error_wallpaper_meta_desc_too_small'),
(137, 1, 'error_wallpaper_meta_kwds_too_small'),
(138, 1, 'error_submit_unable'),
(139, 1, 'error_edit_unable'),
(140, 1, 'error_subject_required'),
(141, 1, 'error_website_invalid'),
(142, 1, 'error_message_required'),
(143, 1, 'message_success_title'),
(144, 1, 'message_maintenance'),
(145, 1, 'message_confirmation_email'),
(146, 1, 'message_registration_success'),
(147, 1, 'message_new_password_sent'),
(148, 1, 'message_password_recovery_ok'),
(149, 1, 'message_image_deleted'),
(150, 1, 'message_all_images_deleted'),
(151, 1, 'message_login_to_submit'),
(152, 1, 'message_unpack_ok'),
(153, 1, 'message_wall_submit_ok'),
(154, 1, 'message_wall_edit_ok'),
(155, 1, 'message_wait_images_are_uploading'),
(156, 1, 'message_wait_images_deleting'),
(157, 1, 'message_wait_images_unpacking'),
(158, 1, 'message_contact_send_ok'),
(159, 1, 'message_wallpaper_delete_ok'),
(160, 1, 'message_wallpaper_delete_failed'),
(161, 1, 'ask_delete_wallpaper'),
(162, 1, 'email_alt_body'),
(163, 1, 'email_register_confirm_subject'),
(164, 1, 'email_new_password_request_subject'),
(165, 1, 'label_submit_title'),
(166, 1, 'label_submit_category'),
(167, 1, 'label_submit_select'),
(168, 1, 'label_submit_morecats'),
(169, 1, 'label_submit_license'),
(170, 1, 'label_submit_author_name'),
(171, 1, 'label_submit_author_website'),
(172, 1, 'label_submit_description'),
(173, 1, 'label_submit_tags'),
(174, 1, 'label_submit_date_pub'),
(175, 1, 'label_submit_featured'),
(176, 1, 'label_submit_featured_y'),
(177, 1, 'label_submit_featured_n'),
(178, 1, 'label_submit_meta_title'),
(179, 1, 'label_submit_meta_description'),
(180, 1, 'label_submit_meta_keywords'),
(181, 1, 'label_submit_save_draft'),
(182, 1, 'label_submit_btn'),
(183, 1, 'label_submit_btn_wait'),
(184, 1, 'stats_views'),
(185, 1, 'stats_downloads'),
(186, 1, 'stats_favourites'),
(187, 1, 'stats_today'),
(188, 1, 'stats_views_box'),
(189, 1, 'stats_downloads_box'),
(190, 1, 'wimganchor'),
(191, 1, 'wimgalt'),
(192, 1, 'whrefanchor'),
(193, 1, 'wcatanchor'),
(194, 1, 'categoryanchor'),
(195, 1, 'resolutionanchor'),
(196, 1, 'resolutionwallnum'),
(197, 1, 'resolutionwallnumone'),
(198, 1, 'resolution_page_title'),
(199, 1, 'resolution_meta_title'),
(200, 1, 'resolution_meta_description'),
(201, 1, 'resolution_meta_keywords'),
(202, 1, 'category_page_title'),
(203, 1, 'category_meta_title'),
(204, 1, 'category_meta_description'),
(205, 1, 'category_meta_keywords'),
(206, 1, 'top_latest'),
(207, 1, 'top_popular'),
(208, 1, 'top_downloaded'),
(209, 1, 'top_favourites'),
(210, 1, 'top_ratings'),
(211, 1, 'tops_latest_url'),
(212, 1, 'tops_popular_url'),
(213, 1, 'tops_downloaded_url'),
(214, 1, 'tops_favourites_url'),
(215, 1, 'tops_ratings_url'),
(216, 1, 'times_all'),
(217, 1, 'times_all_url'),
(218, 1, 'times_today'),
(219, 1, 'times_today_url'),
(220, 1, 'times_last_7_days'),
(221, 1, 'times_last_7_days_url'),
(222, 1, 'times_last_30_days'),
(223, 1, 'times_last_30_days_url'),
(224, 1, 'times_this_month'),
(225, 1, 'times_this_month_url'),
(226, 1, 'times_last_month'),
(227, 1, 'times_last_month_url'),
(228, 1, 'top_page_title'),
(229, 1, 'top_meta_title'),
(230, 1, 'top_meta_description'),
(231, 1, 'top_meta_keywords'),
(232, 1, 'page'),
(233, 1, 'resolutions_meta_title'),
(234, 1, 'resolutions_meta_description'),
(235, 1, 'resolutions_meta_keywords'),
(236, 1, 'nomembers'),
(237, 1, 'community_page_title'),
(238, 1, 'community_meta_title'),
(239, 1, 'community_meta_description'),
(240, 1, 'community_meta_keywords'),
(241, 1, 'member_suspended'),
(242, 1, 'member_not_seen_yet'),
(243, 1, 'member_uploads'),
(244, 1, 'member_downloads'),
(245, 1, 'member_comments'),
(246, 1, 'member_favourites'),
(247, 1, 'search_results'),
(248, 1, 'search_adv_results'),
(249, 1, 'search_adv_page_title'),
(250, 1, 'search_adv_meta_title'),
(251, 1, 'label_search_for'),
(252, 1, 'label_search_select'),
(253, 1, 'label_category'),
(254, 1, 'label_resolution'),
(255, 1, 'label_license'),
(256, 1, 'btnsearch'),
(257, 1, 'rss_meta_title'),
(258, 1, 'rss_categories'),
(259, 1, 'rss_resolutions'),
(260, 1, 'sitemap_meta_title'),
(261, 1, 'my_wallpapers'),
(262, 1, 'my_wallpapers_meta_title'),
(263, 1, 'status_active'),
(264, 1, 'status_pending'),
(265, 1, 'status_rejected'),
(266, 1, 'status_disabled'),
(267, 1, 'status_draft'),
(268, 1, 'edit_wallpaper_title'),
(269, 1, 'contact_meta_title'),
(270, 1, 'contact_meta_description'),
(271, 1, 'contact_meta_keywords'),
(272, 1, 'label_contact_subject'),
(273, 1, 'label_contact_name'),
(274, 1, 'label_contact_email'),
(275, 1, 'label_contact_website'),
(276, 1, 'btn_send_contact'),
(277, 1, 'label_contact_message'),
(278, 1, 'error_username_restricted'),
(852, 1, 'menu_my_profile'),
(853, 1, 'menu_my_downloads'),
(854, 1, 'menu_my_favourites'),
(855, 1, 'member_comments_title'),
(856, 1, 'contact_page_title'),
(857, 1, 'my_walls_unpublished'),
(858, 1, 'my_walls_published'),
(859, 1, 'my_walls_downloaded'),
(860, 1, 'your_published_walls'),
(861, 1, 'your_downloaded_walls'),
(862, 1, 'my_comments_all'),
(863, 1, 'my_comments_made'),
(864, 1, 'my_pending_walls'),
(865, 1, 'my_rejected_walls'),
(866, 1, 'my_disabled_walls'),
(867, 1, 'my_walls_favourite'),
(868, 1, 'your_favourite_walls'),
(869, 1, 'my_walls_rated'),
(870, 1, 'my_num_likes'),
(871, 1, 'my_num_dislikes'),
(872, 1, 'this_profile_is_private'),
(873, 1, 'user_joined_on'),
(874, 1, 'user_last_seen'),
(875, 1, 'downloaded_for_resolution'),
(876, 1, 'user_real_name'),
(877, 1, 'user_nickname'),
(878, 1, 'user_birthday'),
(879, 1, 'user_date_of_birth'),
(880, 1, 'birthday_example'),
(881, 1, 'user_years_old'),
(882, 1, 'user_homepage'),
(883, 1, 'user_blog'),
(884, 1, 'user_twitter'),
(885, 1, 'user_facebook'),
(886, 1, 'user_linkedin'),
(887, 1, 'user_icq'),
(888, 1, 'user_aim'),
(889, 1, 'user_msn'),
(890, 1, 'user_yahoo'),
(891, 1, 'user_skype'),
(892, 1, 'user_interests'),
(893, 1, 'user_location'),
(894, 1, 'user_about_me'),
(895, 1, 'change_profile_image'),
(896, 1, 'change_profile_image_desc'),
(897, 1, 'back_to_settings'),
(898, 1, 'settings_close_acc'),
(899, 1, 'settings_close_acc_desc'),
(900, 1, 'settings_close_acc_btn'),
(901, 1, 'settings_email'),
(902, 1, 'settings_your_email_is'),
(903, 1, 'settings_your_password'),
(904, 1, 'settings_your_new_email'),
(905, 1, 'settings_your_new_email_retype'),
(906, 1, 'settings_email_new_btn'),
(907, 1, 'settings_notif_title'),
(908, 1, 'settings_notif_wallpaper_comm'),
(909, 1, 'settings_notif_wallpaper_status'),
(910, 1, 'settings_notif_btn'),
(911, 1, 'lang_choose_yes'),
(912, 1, 'lang_choose_no'),
(913, 1, 'settings_privacy_title'),
(914, 1, 'settings_privacy_desc'),
(915, 1, 'settings_privacy_show_author'),
(916, 1, 'settings_privacy_profile'),
(917, 1, 'settings_privacy_opt_everyone'),
(918, 1, 'settings_privacy_opt_only_me'),
(919, 1, 'settings_privacy_opt_logged_members'),
(920, 1, 'settings_privacy_view_contact_info'),
(921, 1, 'settings_privacy_view_bio'),
(922, 1, 'settings_privacy_view_avatar'),
(923, 1, 'settings_privacy_view_downloads'),
(924, 1, 'settings_privacy_view_favs'),
(925, 1, 'settings_privacy_view_walls'),
(926, 1, 'settings_privacy_btn'),
(927, 1, 'settings_pw_title'),
(928, 1, 'settings_pw_current'),
(929, 1, 'settings_pw_new'),
(930, 1, 'settings_pw_new_r'),
(931, 1, 'settings_pw_btn'),
(932, 1, 'settings_profile_title'),
(933, 1, 'settings_profile_btn'),
(934, 1, 'settings_and_preferences'),
(935, 1, 'settings_profile_image'),
(936, 1, 'settings_profile_image_desc'),
(937, 1, 'settings_profile_desc'),
(938, 1, 'settings_edit_email_title'),
(939, 1, 'settings_edit_pw_title'),
(940, 1, 'settings_notif_desc'),
(941, 1, 'settings_edit_email_desc'),
(942, 1, 'settings_edit_pw_desc'),
(943, 1, 'no_tags'),
(944, 1, 'back_to_wallpaper'),
(945, 1, 'download_wallpaper'),
(946, 1, 'wallpaper_preview_title'),
(947, 1, 'click_to_download'),
(948, 1, 'click_to_download_img_alt'),
(949, 1, 'profile_meta_title'),
(950, 1, 'profile_private_meta_title'),
(951, 1, 'profile_uploads'),
(952, 1, 'profile_downloads'),
(953, 1, 'profile_favourites'),
(954, 1, 'user_member_since'),
(955, 1, 'user_said_on_date'),
(956, 1, 'user_said'),
(957, 1, 'submit_comment_btn'),
(958, 1, 'cancel_comment_btn'),
(959, 1, 'js_wallpaper_was_added_to_favourites'),
(960, 1, 'js_you_have_to_login_first'),
(961, 1, 'js_download_will_begin'),
(962, 1, 'js_wallpaper_was_removed_from_fav'),
(963, 1, 'js_voting_thank'),
(964, 1, 'js_type_a_message'),
(965, 1, 'js_comment_submit'),
(966, 1, 'js_confirm'),
(967, 1, 'global_filter_set'),
(968, 1, 'global_browsing_your_screen'),
(969, 1, 'global_filter_unset'),
(970, 1, 'global_filter_normal'),
(971, 1, 'settings_meta_title'),
(972, 1, 'error_avatar_not_image'),
(973, 1, 'error_avatar_select_image'),
(974, 1, 'success_avatar_changed'),
(975, 1, 'settings_avatar_meta_title'),
(976, 1, 'error_invalid_birthday_year'),
(977, 1, 'error_invalid_birthday_month'),
(978, 1, 'error_invalid_birthday_day'),
(979, 1, 'error_invalid_birthday'),
(980, 1, 'error_some_invalid_urls'),
(981, 1, 'profile_settings_meta_title'),
(982, 1, 'success_profile_updated'),
(983, 1, 'success_privacy_updated'),
(984, 1, 'settings_privacy_meta_title'),
(985, 1, 'success_notif_updated'),
(986, 1, 'error_your_password_required'),
(987, 1, 'error_wrong_password'),
(988, 1, 'error_new_email_is_required'),
(989, 1, 'error_invalid_email'),
(990, 1, 'error_duplicate_email'),
(991, 1, 'error_retype_email'),
(992, 1, 'error_emails_no_match'),
(993, 1, 'success_email_changed'),
(994, 1, 'error_unable_to_change_email'),
(995, 1, 'change_email_meta_title'),
(996, 1, 'error_new_password_required'),
(997, 1, 'error_new_password_too_short'),
(998, 1, 'error_new_password_retype'),
(999, 1, 'error_passwords_dont_match'),
(1000, 1, 'success_password_changed'),
(1001, 1, 'success_login_again'),
(1002, 1, 'error_unable_to_change_pwd'),
(1003, 1, 'change_pwd_meta_title'),
(1004, 1, 'walls_tagged_with_title'),
(1005, 1, 'walls_tagged_with_meta_title');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_lang_s`
--

CREATE TABLE `hdwallsite_configs_lang_s` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL DEFAULT 0,
  `name` varchar(155) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_lang_s`
--

INSERT INTO `hdwallsite_configs_lang_s` (`id`, `parent_id`, `name`) VALUES
(1, 0, 'Website'),
(2, 0, 'Administration');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_lang_t`
--

CREATE TABLE `hdwallsite_configs_lang_t` (
  `id` int(11) NOT NULL,
  `param_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  `translation` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_lang_t`
--

INSERT INTO `hdwallsite_configs_lang_t` (`id`, `param_id`, `language_id`, `translation`) VALUES
(1, 1, 1, 'PHP Wallpaper Script'),
(2, 2, 1, ''),
(3, 3, 1, 'PHP Wallpaper Script'),
(4, 4, 1, ''),
(5, 5, 1, 'php wallpaper script,wallpaper script'),
(6, 6, 1, 'Home'),
(7, 7, 1, 'Browse'),
(8, 8, 1, 'Tag Cloud'),
(9, 9, 1, 'Tag Cloud'),
(10, 10, 1, ''),
(11, 11, 1, ''),
(12, 12, 1, 'Community'),
(13, 13, 1, 'Submit'),
(14, 14, 1, 'Advanced Search'),
(15, 15, 1, 'search for wallpapers...'),
(16, 16, 1, 'Administration'),
(17, 17, 1, 'Current location: '),
(18, 18, 1, 'RSS Feeds'),
(19, 19, 1, 'Contact'),
(20, 20, 1, 'Sitemap'),
(21, 21, 1, '©2011 phpwallpaperscript.com - Some rights reserved'),
(22, 22, 1, 'powered by'),
(23, 23, 1, 'Latest Wallpapers'),
(24, 24, 1, 'Popular Wallpapers'),
(25, 25, 1, 'Top Downloaded Wallpapers'),
(26, 26, 1, 'Top Favourite Wallpapers'),
(27, 27, 1, 'Top Rated Wallpapers'),
(28, 28, 1, 'Browse by Categories'),
(29, 29, 1, 'Browse by Resolutions'),
(30, 30, 1, 'Your resolution is: '),
(31, 31, 1, 'Apply filter and set global'),
(32, 32, 1, 'Unset Global Filter'),
(33, 33, 1, 'Global Filters'),
(34, 34, 1, 'Showing wallpapers for: '),
(35, 35, 1, 'Login'),
(36, 36, 1, 'Logout'),
(37, 37, 1, 'Sign-up'),
(38, 38, 1, 'Ooops... the page you requested was not found!'),
(39, 39, 1, 'We\'re sorry... but this page is not available.'),
(40, 40, 1, 'Member Login'),
(41, 41, 1, 'Don\'t have an account?'),
(42, 42, 1, 'Forgot your password?'),
(43, 43, 1, 'Username / Email Address'),
(44, 44, 1, 'Username'),
(45, 45, 1, 'Email Address'),
(46, 46, 1, 'Password'),
(47, 47, 1, 'Re-Type Password'),
(48, 48, 1, 'Remember me?'),
(49, 49, 1, 'Type security code here: '),
(50, 50, 1, 'Login'),
(51, 51, 1, 'Generate New Password'),
(52, 52, 1, 'Create account'),
(53, 53, 1, 'Sign-up'),
(54, 54, 1, 'Sign-up is not available'),
(55, 55, 1, 'Member Login'),
(56, 56, 1, 'Password recovery'),
(57, 57, 1, 'We\'re sorry but at this moment we don\'t accept new users. Thank you. '),
(58, 58, 1, 'Submit Wallpapers'),
(59, 59, 1, 'My Wallpapers'),
(61, 61, 1, 'Settings &amp; Preferences'),
(62, 62, 1, 'Howdy, '),
(63, 63, 1, 'Featured Wallpapers'),
(64, 64, 1, 'Upload Wallpapers'),
(65, 65, 1, 'Pack Upload'),
(66, 66, 1, 'Upload Images'),
(67, 67, 1, 'List of compatible resolutions'),
(68, 68, 1, 'view {resolution_name} resolutions'),
(69, 69, 1, '&raquo; Upload <b>only .zip</b> archives.<br> &raquo; The archive should contain images <b>(jpg or png and placed in root)</b> that match with your resolution sets.<br>'),
(70, 70, 1, 'Wallpaper Details'),
(71, 71, 1, 'Name'),
(72, 72, 1, 'Type'),
(73, 73, 1, 'Width'),
(74, 74, 1, 'Height'),
(75, 75, 1, 'Are you sure?'),
(76, 76, 1, 'no wallpapers were found'),
(77, 77, 1, 'Date Uploaded:'),
(78, 78, 1, 'F d, Y'),
(79, 79, 1, 'Category:'),
(80, 80, 1, 'Added By:'),
(81, 81, 1, 'License:'),
(82, 82, 1, 'Statistics:'),
(83, 83, 1, 'Available Resolutions'),
(84, 84, 1, '{resolution} resolution for {wallpaper} wallpaper'),
(85, 85, 1, 'Tags:'),
(86, 86, 1, '{wallpaper} HD Wallpaper - {category} Wallpapers'),
(87, 87, 1, 'Download {wallpaper} Wallpaper. Find more {category} wallpapers.'),
(88, 88, 1, 'hd {wallpaper} wallpaper,full hd {wallpaper} wallpaper,{category} hd wallpapers'),
(89, 89, 1, 'Related Wallpapers'),
(90, 90, 1, 'Registration confirmation'),
(91, 91, 1, 'Invalid confirmation key'),
(92, 92, 1, 'Your account was successfully activated! You may now login.'),
(93, 93, 1, 'Username or Email address is required!'),
(94, 94, 1, 'Password is required!'),
(95, 95, 1, 'Invalid username or password'),
(96, 96, 1, 'Please check your email inbox! We sent you a confirmation key!'),
(97, 97, 1, 'Your account was suspended!'),
(98, 98, 1, 'This account was closed!'),
(99, 99, 1, 'Could not log you in! Please try again later!'),
(100, 100, 1, 'Security code is required'),
(101, 101, 1, 'Invalid security code'),
(102, 102, 1, 'Username is required!'),
(103, 103, 1, 'Username characters are invalid! Allowable: letters,numbers,underscores.'),
(104, 104, 1, 'This username already exists!'),
(105, 105, 1, 'Email Address is required!'),
(106, 106, 1, 'Invalid Email Address!'),
(107, 107, 1, 'This email address already exists!'),
(108, 108, 1, 'This email address was not found in our database!'),
(109, 109, 1, 'Password is required!'),
(110, 110, 1, 'Invalid password characters! Allowable: letters,numbers,underscores.'),
(111, 111, 1, 'Password Re-Type is required!'),
(112, 112, 1, 'Passwords do not match!'),
(113, 113, 1, 'Unable to sign up! Please try again later.'),
(114, 114, 1, 'Unable to send your new password. Please try again later.'),
(115, 115, 1, 'Invalid confirmation key!'),
(116, 116, 1, 'Some error occured. The system was unable to save the new password. Please try again later.'),
(117, 117, 1, 'To submit wallpapers you have to be logged in.'),
(118, 118, 1, 'Select some images first'),
(119, 119, 1, 'Invalid {name} resolution'),
(120, 120, 1, '{name} is not an image!'),
(121, 121, 1, 'Don\'t just click \"Upload\"! Select some zip archive first...'),
(122, 122, 1, 'Cannot open zip archive!'),
(123, 123, 1, 'Unable to perform this action!'),
(124, 124, 1, 'Title is required!'),
(125, 125, 1, 'Title is too small'),
(126, 126, 1, 'Parent category is required'),
(127, 127, 1, 'License is required'),
(128, 128, 1, 'Invalid category'),
(129, 129, 1, 'Invalid license'),
(130, 130, 1, 'Author name is too small'),
(131, 131, 1, 'Author website URL is invalid'),
(132, 132, 1, 'Description is too small'),
(133, 133, 1, '{tag} tag is too small'),
(134, 134, 1, 'Meta title is too small'),
(135, 135, 1, 'Date to publish needs to be higher than today'),
(136, 136, 1, 'Meta description is too small'),
(137, 137, 1, '{keyword} keyword is too small'),
(138, 138, 1, 'Some error occured. Unable to submit your wallpaper.'),
(139, 139, 1, 'Some error occured. Unable to update your wallpaper.'),
(140, 140, 1, 'Subject is required'),
(141, 141, 1, 'The URL entered is invalid'),
(142, 142, 1, 'Message is required'),
(143, 143, 1, 'Success!'),
(144, 144, 1, 'We\'re really sorry, but our site is down for maintenance. Please come back later.'),
(145, 145, 1, 'Check your email address and confirm your account.'),
(146, 146, 1, 'The account was successfully created'),
(147, 147, 1, 'New password was sent. Please check your email!'),
(148, 148, 1, 'Your new password was set. You can login now.'),
(149, 149, 1, 'Image was deleted'),
(150, 150, 1, 'All image were deleted'),
(151, 151, 1, 'Submission is allowed only for members'),
(152, 152, 1, '{images} images were unpacked successfully!'),
(153, 153, 1, 'Your wallpaper was submitted successfully!'),
(154, 154, 1, 'Your wallpaper was updated successfully!'),
(155, 155, 1, 'Images are uploading. Please wait...'),
(156, 156, 1, 'Images will be removed. Please wait...'),
(157, 157, 1, 'Unpacking...'),
(158, 158, 1, 'Thank you for contacting us. Please allow a few days to answer.'),
(159, 159, 1, 'Wallpaper was deleted successfully'),
(160, 160, 1, 'The system was unable to delete this wallpaper'),
(161, 161, 1, 'Are you sure you want to delete this wallpaper?'),
(162, 162, 1, 'To view the message, please use an HTML compatible email viewer!'),
(163, 163, 1, 'Registration Confirmation'),
(164, 164, 1, 'Your new password'),
(165, 165, 1, 'Title'),
(166, 166, 1, 'Parent Category'),
(167, 167, 1, '- select -'),
(168, 168, 1, 'select more categories'),
(169, 169, 1, 'License'),
(170, 170, 1, 'Author Name'),
(171, 171, 1, 'Author Website'),
(172, 172, 1, 'Description'),
(173, 173, 1, 'Tags (comma separated)'),
(174, 174, 1, 'Date to publish'),
(175, 175, 1, 'Featured?'),
(176, 176, 1, 'Yes'),
(177, 177, 1, 'No'),
(178, 178, 1, 'Meta Title'),
(179, 179, 1, 'Meta Description'),
(180, 180, 1, 'Meta Keywords'),
(181, 181, 1, 'Save as Draft'),
(182, 182, 1, 'Submit'),
(183, 183, 1, 'Please wait...'),
(184, 184, 1, 'Total views: '),
(185, 185, 1, 'Total downloads: '),
(186, 186, 1, 'Total favourite: '),
(187, 187, 1, 'Today: '),
(188, 188, 1, 'views'),
(189, 189, 1, 'downloads'),
(190, 190, 1, '{wallpaper} Wallpaper'),
(191, 191, 1, '{wallpaper} Wallpaper'),
(192, 192, 1, '{wallpaper} Wallpaper'),
(193, 193, 1, 'Download {category} wallpapers'),
(194, 194, 1, '{category} Wallpapers'),
(195, 195, 1, '{resolution} Wallpapers'),
(196, 196, 1, '{number} wallpapers'),
(197, 197, 1, '{number} wallpaper'),
(198, 198, 1, '{resolution} Wallpapers'),
(199, 199, 1, '{resolution} Wallpapers'),
(200, 200, 1, 'Download High Quality {resolution} Wallpapers'),
(201, 201, 1, 'hd {resolution},full hd {resolution},hd {resolution} wallpapers'),
(202, 202, 1, '{category} Wallpapers'),
(203, 203, 1, '{category} Wallpapers'),
(204, 204, 1, 'Download High Quality {category} Wallpapers'),
(205, 205, 1, 'hd {category} wallpaper,full hd {category} wallpaper,hd {category} wallpapers'),
(206, 206, 1, 'Latest'),
(207, 207, 1, 'Popular'),
(208, 208, 1, 'Top Downloaded'),
(209, 209, 1, 'Top Favourites'),
(210, 210, 1, 'Top Rated'),
(211, 211, 1, 'latest'),
(212, 212, 1, 'popular'),
(213, 213, 1, 'top-downloaded'),
(214, 214, 1, 'top-favourite'),
(215, 215, 1, 'top-rated'),
(216, 216, 1, 'All Times'),
(217, 217, 1, ''),
(218, 218, 1, 'Today'),
(219, 219, 1, 'today'),
(220, 220, 1, 'Last 7 Days'),
(221, 221, 1, 'last-7-days'),
(222, 222, 1, 'Last 30 Days'),
(223, 223, 1, 'last-30-days'),
(224, 224, 1, 'This Month'),
(225, 225, 1, 'this-month'),
(226, 226, 1, 'Last Month'),
(227, 227, 1, 'last-month'),
(228, 228, 1, '{top} Wallpapers'),
(229, 229, 1, '{top} Wallpapers'),
(230, 230, 1, 'Download High Quality {top} Wallpapers'),
(231, 231, 1, 'hd {top} wallpaper,full hd {top} wallpaper,hd {top} wallpapers'),
(232, 232, 1, ' - Page {pageno}'),
(233, 233, 1, 'Latest wallpapers by resolution'),
(234, 234, 1, 'View latest wallpapers by resolution'),
(235, 235, 1, 'hd wallpapers,full hd wallpapers'),
(236, 236, 1, 'no members'),
(237, 237, 1, 'Community ({total} members)'),
(238, 238, 1, 'Community'),
(239, 239, 1, 'Members of our community'),
(240, 240, 1, 'wallpaper community'),
(241, 241, 1, 'This user was banned'),
(242, 242, 1, '<i>never</i>'),
(243, 243, 1, '{num} uploaded wallpapers'),
(244, 244, 1, '{num} downloaded wallpapers'),
(245, 245, 1, '{num} comments'),
(246, 246, 1, '{num} favourite wallpapers'),
(247, 247, 1, '{records} wallpaper(s) found for: <i><u>{query}</u></i>'),
(248, 248, 1, '{records} wallpaper(s) found'),
(249, 249, 1, 'Advanced Search Form'),
(250, 250, 1, 'Advanced Search'),
(251, 251, 1, 'Search term'),
(252, 252, 1, '- select -'),
(253, 253, 1, 'Select Category'),
(254, 254, 1, 'Select Resolution'),
(255, 255, 1, 'Select License'),
(256, 256, 1, 'Search'),
(257, 257, 1, 'RSS Feeds'),
(258, 258, 1, 'Categories:'),
(259, 259, 1, 'Resolutions:'),
(260, 260, 1, 'Sitemap'),
(261, 261, 1, 'You have {records} {status} wallpapers'),
(262, 262, 1, 'My Wallpapers'),
(263, 263, 1, 'Active'),
(264, 264, 1, 'Pending'),
(265, 265, 1, 'Rejected'),
(266, 266, 1, 'Disabled'),
(267, 267, 1, 'Draft'),
(268, 268, 1, 'Edit: {wallpaper}'),
(269, 269, 1, 'Contact'),
(270, 270, 1, ''),
(271, 271, 1, ''),
(272, 272, 1, 'Subject'),
(273, 273, 1, 'Name'),
(274, 274, 1, 'Email Address'),
(275, 275, 1, 'Website URL'),
(276, 276, 1, 'Send Message'),
(277, 277, 1, 'Message'),
(278, 278, 1, 'Username restricted'),
(279, 852, 1, 'My Profile'),
(280, 853, 1, 'My Downloads'),
(281, 854, 1, 'My Favourites'),
(282, 855, 1, 'Member Comments'),
(283, 856, 1, 'Contact Us'),
(284, 857, 1, 'Unpublished'),
(285, 858, 1, 'Published'),
(286, 859, 1, 'Downloaded'),
(287, 860, 1, 'you published {num} wallpapers'),
(288, 861, 1, 'you downloaded {all_downloads} wallpapers ({unique_downloads} unique) '),
(289, 862, 1, 'Comments'),
(290, 863, 1, 'you made {num} comments'),
(291, 864, 1, 'pending'),
(292, 865, 1, 'rejected'),
(293, 866, 1, 'disabled'),
(294, 867, 1, 'Favourites'),
(295, 868, 1, 'you have {num} favourite wallpapers'),
(296, 869, 1, 'Ratings'),
(297, 870, 1, 'likes'),
(298, 871, 1, 'dislikes'),
(299, 872, 1, 'This profile is private.'),
(300, 873, 1, 'Joined on '),
(301, 874, 1, 'Last seen: '),
(302, 875, 1, 'Downloaded for: '),
(303, 876, 1, 'Real name:'),
(304, 877, 1, 'Nickname:'),
(305, 878, 1, 'Birthday:'),
(306, 879, 1, 'Date of birth'),
(307, 880, 1, 'e.g'),
(308, 881, 1, 'years old'),
(309, 882, 1, 'My Homepage:'),
(310, 883, 1, 'My Blog:'),
(311, 884, 1, 'Twitter:'),
(312, 885, 1, 'Facebook:'),
(313, 886, 1, 'Linkedin:'),
(314, 887, 1, 'ICQ Number:'),
(315, 888, 1, 'AIM Screen Name:'),
(316, 889, 1, 'MSN Messenger:'),
(317, 890, 1, 'Yahoo! Messenger:'),
(318, 891, 1, 'Skype Name:'),
(319, 892, 1, 'Interests:'),
(320, 893, 1, 'Location:'),
(321, 894, 1, 'About me'),
(322, 895, 1, 'Change your profile image'),
(323, 896, 1, '<b>This is your current profile image / avatar</b><br /><br />Select a picture from your computer:<br />'),
(324, 897, 1, '&laquo; back to settings'),
(325, 898, 1, 'Close my account'),
(326, 899, 1, 'Please tell us why you want to close your account (optional):'),
(327, 900, 1, 'Close my account'),
(328, 901, 1, 'Change Email'),
(329, 902, 1, 'Current Email Address is:'),
(330, 903, 1, 'Your Password'),
(331, 904, 1, 'New email address'),
(332, 905, 1, 'Re-Type new email address'),
(333, 906, 1, 'Change Email Address'),
(334, 907, 1, 'Messaging &amp; Notification'),
(335, 908, 1, 'Notify me when somebody comments on my wallpapers'),
(336, 909, 1, 'Notify me when my wallpaper status is changed'),
(337, 910, 1, 'Update Messaging &amp; Notification'),
(338, 911, 1, 'Yes'),
(339, 912, 1, 'No'),
(340, 913, 1, 'Privacy Settings'),
(341, 914, 1, 'Set what\'s public or private on your profile.'),
(342, 915, 1, 'Show wallpaper author'),
(343, 916, 1, 'View my profile'),
(344, 917, 1, 'Everyone'),
(345, 918, 1, 'Only me'),
(346, 919, 1, 'Logged Members'),
(347, 920, 1, 'View my contact info'),
(348, 921, 1, 'View my biography'),
(349, 922, 1, 'View my avatar'),
(350, 923, 1, 'View my downloads'),
(351, 924, 1, 'View my favourites'),
(352, 925, 1, 'View my wallpapers'),
(353, 926, 1, 'Update Privacy'),
(354, 927, 1, 'Change Password'),
(355, 928, 1, 'Current Password'),
(356, 929, 1, 'New Password'),
(357, 930, 1, 'Re-Type new password'),
(358, 931, 1, 'Change Password'),
(359, 932, 1, 'Profile Settings ({percent}% completed)'),
(360, 933, 1, 'Update My Profile'),
(361, 934, 1, 'Settings &amp; Preferences'),
(362, 935, 1, 'Profile Image'),
(363, 936, 1, 'Change your avatar.'),
(364, 937, 1, 'Manage your profile details.'),
(365, 938, 1, 'Edit email address'),
(366, 939, 1, 'Edit password'),
(367, 940, 1, 'Email notifications. Choose what emails to receive.'),
(368, 941, 1, 'Change your email.'),
(369, 942, 1, 'Change your password.'),
(370, 943, 1, 'No tags!'),
(371, 944, 1, 'back to wallpaper'),
(372, 945, 1, 'download'),
(373, 946, 1, '{wallpaper} {resolution} wallpaper'),
(374, 947, 1, 'Click to download {wallpaper} {resolution} wallpaper'),
(375, 948, 1, '{wallpaper} for {resolution} resolution'),
(376, 949, 1, '{username}\'s profile'),
(377, 950, 1, '{username}\'s private profile'),
(378, 951, 1, 'Uploads'),
(379, 952, 1, 'Downloads'),
(380, 953, 1, 'Favourites'),
(381, 954, 1, 'Member since: '),
(382, 955, 1, 'On {date}'),
(383, 956, 1, 'said:'),
(384, 957, 1, 'submit'),
(385, 958, 1, 'cancel'),
(386, 959, 1, 'Wallpaper was added to favourites'),
(387, 960, 1, 'You have to login first!'),
(388, 961, 1, 'Your download will start in a few seconds. Please wait...'),
(389, 962, 1, 'Wallpaper was removed from favourites'),
(390, 963, 1, 'Thank you for voting!'),
(391, 964, 1, 'You have to type a message'),
(392, 965, 1, 'Thank you. Please allow 24 hours for reviewing your comment!'),
(393, 966, 1, 'Are you sure?'),
(394, 967, 1, 'Global filter was set'),
(395, 968, 1, 'You are now browsing only wallpapers that fit with your screen.'),
(396, 969, 1, 'Global filter was unset'),
(397, 970, 1, 'You are now browsing all wallpapers.'),
(398, 971, 1, 'Settings'),
(399, 972, 1, '{filename} is not an image!'),
(400, 973, 1, 'Select an image first!'),
(401, 974, 1, 'Your profile image was changed successfully!'),
(402, 975, 1, 'Change your profile image'),
(403, 976, 1, 'Invalid birthday year!'),
(404, 977, 1, 'Invalid birthday month!'),
(405, 978, 1, 'Invalid birthday day!'),
(406, 979, 1, 'Invalid birthday!'),
(407, 980, 1, 'There are some invalid URLs. Please check!'),
(408, 981, 1, 'Profile Settings'),
(409, 982, 1, 'Your profile was updated!'),
(410, 983, 1, 'Your privacy was updated!'),
(411, 984, 1, 'Privacy Settings'),
(412, 985, 1, 'Messaging and notification settings were updated!'),
(413, 986, 1, 'Your password is required'),
(414, 987, 1, 'Wrong password'),
(415, 988, 1, 'New email address is required'),
(416, 989, 1, 'Invalid email address'),
(417, 990, 1, 'This email address is already in our database!'),
(418, 991, 1, 'Re-Type the new email address'),
(419, 992, 1, 'The entered email addresses do not match!'),
(420, 993, 1, 'Your email address was changed to <b>{email}</b>!'),
(421, 994, 1, 'The system was unable to change your email address. Please try again later or contact support.'),
(422, 995, 1, 'Edit your email address'),
(423, 996, 1, 'New Password is required'),
(424, 997, 1, 'The password is too short. Type minimum 4 characters!'),
(425, 998, 1, 'Re-Type the new password'),
(426, 999, 1, 'The entered passwords do not match!'),
(427, 1000, 1, 'Your password was changed successfully.'),
(428, 1001, 1, 'You have to login again.'),
(429, 1002, 1, 'The system was unable to change your password. Please try again later or contact support.'),
(430, 1003, 1, 'Edit your password'),
(431, 1004, 1, 'Wallpapers tagged with: <i><u>{tag}</u></i>'),
(432, 1005, 1, 'Wallpapers tagged with: {tag}'),
(470, 1005, 2, 'Wallpapere taguite cu: {tag}'),
(472, 1004, 2, 'Wallpapere taguite cu: {tag}'),
(473, 1003, 2, 'Editeaza parola'),
(474, 1002, 2, 'Sistemul nu a putut să schimbe parola. Vă rugăm să încercați din nou mai târziu sau contactați asistența.'),
(475, 1001, 2, 'Trebuie sa va autentificati din nou'),
(476, 1000, 2, 'Parola a fost schimbata cu succes'),
(477, 999, 2, 'Parolele introduse nu sunt la fel'),
(478, 998, 2, 'Re-Introduceți noua parolă'),
(479, 12, 2, 'Comunitate'),
(480, 997, 2, 'Parola este prea scurta. Tastați minim 4 caractere!'),
(481, 996, 2, 'Parola noua este obligatorie'),
(482, 995, 2, 'Editeaza adresa de email'),
(483, 994, 2, 'Sistemul a fost în imposibilitatea de a schimba adresa de e-mail. Vă rugăm să încercați din nou mai târziu sau contactați asistența.'),
(484, 993, 2, 'Adresa de email a fost schimbata cu {email}!'),
(485, 992, 2, 'Adresele de email introduse nu se potrivesc!'),
(486, 991, 2, 'Rescrieti adresa de email'),
(487, 990, 2, 'Aceasta adresa de email exista deja'),
(488, 989, 2, 'Adresa de email este invalida'),
(489, 988, 2, 'Noua adresa de email este obligatorie'),
(490, 987, 2, 'Parola gresita'),
(491, 986, 2, 'Parola este obligatorie'),
(492, 985, 2, 'Setările de mesagerie și de notificare au fost actualizate!'),
(493, 984, 2, 'Setări de confidențialitate'),
(494, 983, 2, 'Setări de confidențialitate au fost actualizate'),
(495, 982, 2, 'Profilul tau a fost actualizat'),
(496, 981, 2, 'Setari de profil'),
(497, 980, 2, 'Există unele URL-uri invalide. Vă rugăm să verificați!'),
(498, 979, 2, 'Ziua de nastere este invalida!'),
(499, 978, 2, 'Ziua este invalida'),
(500, 977, 2, 'Luna este invalida'),
(501, 976, 2, 'Anul este invalid'),
(502, 975, 2, 'Schimba imaginea de profil'),
(503, 974, 2, 'Imaginea de profil a fost schimbata cu succes'),
(504, 973, 2, 'Selecteaza o imagine intai'),
(505, 972, 2, '{filename} nu este imagine'),
(506, 971, 2, 'Setari'),
(507, 970, 2, 'Ai revenit la setarile de baza'),
(508, 969, 2, 'Filtrele globale au fost resetate'),
(509, 968, 2, 'Acum navighezi doar prin wallpaperele care au rezolutia calculatorului tau'),
(510, 967, 2, 'Filtrele globale au fost setate'),
(511, 966, 2, 'Esti sigur?'),
(512, 965, 2, 'Multumim pentru comentariu. Te rugam sa acorzi cel putin 24 de ore pana cand comentariul va deveni activ!'),
(513, 964, 2, 'Trebuie scrii un comentariu'),
(514, 963, 2, 'Multumim pentru vot!'),
(515, 962, 2, 'Wallpaperul a fost scos din favorite'),
(516, 961, 2, 'Descărcarea va începe în câteva secunde. Vă rugăm să așteptați ...'),
(517, 960, 2, 'Trebuie sa fii logat!'),
(518, 959, 2, 'Wallpaperul a fost adaugat la favorite'),
(519, 958, 2, 'renunta'),
(520, 957, 2, 'Adauga'),
(521, 956, 2, 'a spus:'),
(522, 955, 2, 'in {date}'),
(523, 954, 2, 'Membru din:'),
(524, 953, 2, 'Favorite'),
(525, 952, 2, 'Downloads'),
(526, 951, 2, 'Uploaduri'),
(527, 950, 2, 'Profilul privat al lui {username}'),
(528, 949, 2, 'Profilul lui {username}'),
(529, 948, 2, '{wallpaper} pentru {resolution}'),
(530, 947, 2, 'Click pentru a descarca {wallpaper} {resolution}'),
(531, 946, 2, '{wallpaper} {resolution} wallpaper'),
(532, 945, 2, 'download'),
(533, 944, 2, 'inapoi la wallpaper'),
(534, 943, 2, 'Nu sunt taguri'),
(535, 942, 2, 'Schimba parola.'),
(536, 941, 2, 'Schimba email.'),
(537, 940, 2, 'Notificări prin e-mail. Alege ce e-mailuri vrei sa primesti.'),
(538, 939, 2, 'Editeaza parola'),
(539, 938, 2, 'Editeaza adresa de email'),
(540, 937, 2, 'Detalii profil.'),
(541, 936, 2, 'Schimba avatar.'),
(542, 935, 2, 'Imagine de profil'),
(543, 934, 2, 'Setari si preferinte'),
(544, 933, 2, 'Salveaza Profil'),
(545, 932, 2, 'Setari profil ({percent}% completat)'),
(546, 931, 2, 'Salveaza parola'),
(547, 930, 2, 'Rescrie parola noua'),
(548, 929, 2, 'Parola noua'),
(549, 928, 2, 'Parola curenta'),
(550, 927, 2, 'Schimba parola'),
(551, 926, 2, 'Salveaza'),
(552, 925, 2, 'Vede profilul meu'),
(553, 924, 2, 'Vede wallpaperele mele favorite'),
(554, 923, 2, 'Vede downloadurile mele'),
(555, 922, 2, 'Vede avatarul meu'),
(556, 921, 2, 'Vede biografia mea'),
(557, 920, 2, 'Vede informatiile mele de contact'),
(558, 919, 2, 'Membri autentificati'),
(559, 918, 2, 'Doar eu'),
(560, 917, 2, 'Oricine'),
(561, 916, 2, 'Vede profilul meu'),
(562, 915, 2, 'Arata autor wallpaper'),
(563, 914, 2, 'Seteaza ce e public sau privat pe profilul tau'),
(564, 913, 2, 'Setari de confidentialitate'),
(565, 912, 2, 'Nu'),
(566, 911, 2, 'Da'),
(567, 910, 2, 'Actualizare Mesagerie si Notificari'),
(568, 909, 2, 'Anunta-ma atunci când starea wallpaperelor mele s-a schimbat'),
(569, 908, 2, 'Anunta-ma cand cineva comenteaza la wallpaperele mele'),
(570, 907, 2, 'Mesagerie si Notificari'),
(571, 906, 2, 'Schimba adresa de email'),
(572, 905, 2, 'Rescrie noua adresa de email'),
(573, 904, 2, 'Adresa noua de email'),
(574, 903, 2, 'Parola'),
(575, 902, 2, 'Adresa de email curenta este:'),
(576, 901, 2, 'Schimba email'),
(577, 900, 2, 'Inchide cont'),
(578, 899, 2, 'Spune-ne de ce vrei sa inchizi contul (optional):'),
(579, 898, 2, 'Inchide cont'),
(580, 897, 2, '« inapoi la setari'),
(583, 896, 2, '<b>Aceasta este imaginea ta de profil</b>\r\n<br>\r\n<br>\r\nSelecteaza imagine:\r\n<br>'),
(584, 895, 2, 'Schimba imaginea de profil'),
(585, 894, 2, 'Despre mine'),
(586, 893, 2, 'Locatie:'),
(587, 892, 2, 'Interese:'),
(588, 891, 2, 'Skype:'),
(589, 890, 2, 'Yahoo! Messenger:'),
(590, 889, 2, 'MSN Messenger:'),
(591, 888, 2, 'AIM Screen Name:'),
(592, 887, 2, 'ICQ Number:'),
(593, 886, 2, 'Linkedin:'),
(594, 885, 2, 'Facebook:'),
(595, 884, 2, 'Twitter:'),
(596, 883, 2, 'Blog:'),
(597, 882, 2, 'Website'),
(598, 881, 2, 'ani'),
(599, 880, 2, 'ex.'),
(600, 879, 2, 'Data nasterii'),
(601, 878, 2, 'Zi de nastere'),
(602, 877, 2, 'Nickname:'),
(603, 876, 2, 'Nume real:'),
(604, 875, 2, 'Descarcat pentru:'),
(605, 874, 2, 'Ultima oara:'),
(606, 873, 2, 'Alaturat in'),
(607, 872, 2, 'Acest profil este privat'),
(608, 871, 2, 'neapreciate'),
(609, 870, 2, 'apreciate'),
(610, 869, 2, 'Ratings'),
(611, 868, 2, 'ai {num} wallpapere favorite'),
(612, 867, 2, 'Favorite'),
(613, 865, 2, 'respinse'),
(614, 864, 2, 'in asteptare'),
(615, 863, 2, 'ai facut {num} comentarii'),
(616, 862, 2, 'Comentarii'),
(617, 861, 2, 'ai descarcat {all_downloads} wallpapere ({unique_downloads} unice)'),
(618, 860, 2, 'ai publicat {num} wallpapere'),
(619, 859, 2, 'Descarcate'),
(620, 858, 2, 'Publicate'),
(621, 857, 2, 'Nepublicate'),
(622, 856, 2, 'Contact'),
(623, 855, 2, 'Comentarii'),
(624, 854, 2, 'Favorite'),
(625, 853, 2, 'Descarcate'),
(626, 852, 2, 'Profilul meu'),
(627, 278, 2, 'Nume utilizator restrictionat'),
(628, 277, 2, 'Mesaj'),
(629, 276, 2, 'Trimite Mesaj'),
(630, 275, 2, 'URL'),
(631, 274, 2, 'Adresa de email'),
(632, 273, 2, 'Nume'),
(633, 272, 2, 'Subiect'),
(634, 269, 2, 'Contact'),
(635, 268, 2, 'Editeaza: {wallpaper}'),
(636, 267, 2, 'Ciorna'),
(637, 266, 2, 'Dezactivat'),
(638, 265, 2, 'Respins'),
(639, 264, 2, 'In asteptare'),
(640, 263, 2, 'Activ'),
(641, 262, 2, 'Wallpaperele mele'),
(642, 261, 2, 'Ai {records} {status} wallpapere'),
(643, 260, 2, 'Harta site'),
(644, 259, 2, 'Rezolutii:'),
(645, 258, 2, 'Categorii:'),
(646, 257, 2, 'Feed RSS'),
(647, 256, 2, 'Cauta'),
(648, 255, 2, 'Selecteaza licenta'),
(649, 254, 2, 'Selecteaza rezolutie'),
(650, 253, 2, 'Selecteaza categorie'),
(651, 252, 2, '- selecteaza -'),
(652, 251, 2, 'Termen de cautare'),
(653, 250, 2, 'Cautare avansata'),
(654, 249, 2, 'Formular cautare avansata'),
(655, 248, 2, '{records} wallpapere gasite'),
(656, 247, 2, '{records} wallpapere gasite pentru: {query}'),
(657, 246, 2, '{num} wallpapere favorite'),
(658, 245, 2, '{num} comentarii'),
(659, 244, 2, '{num} wallpapere descarcate'),
(660, 243, 2, '{num} wallpapere uploadate'),
(661, 242, 2, '<i>niciodata</i>'),
(662, 241, 2, 'Acest user a fost banat'),
(663, 240, 2, 'comunitate wallpapere'),
(664, 239, 2, 'Membrii comunitatii'),
(665, 238, 2, 'Comunitate'),
(666, 237, 2, 'Comunitate ({total} membrii)'),
(667, 236, 2, 'nu sunt membrii'),
(668, 235, 2, 'hd wallpapers,full hd wallpapers'),
(669, 234, 2, 'Ultimele wallpapere dupa rezolutie'),
(670, 233, 2, 'Ultimele wallpapere dupa rezolutie'),
(671, 232, 2, '- Pagina {pageno}'),
(672, 231, 2, 'hd {top} wallpaper,full hd {top} wallpaper,hd {top} wallpapere'),
(673, 230, 2, 'Descarca HD {top} Wallpapere'),
(674, 229, 2, '{top} Wallpapere'),
(675, 228, 2, '{top} Wallpapere'),
(676, 227, 2, 'luna-trecuta'),
(677, 226, 2, 'Luna trecuta'),
(678, 225, 2, 'luna-asta'),
(679, 224, 2, 'Luna asta'),
(680, 223, 2, 'ultimele-30-zile'),
(681, 222, 2, 'Ultimele 30 zile'),
(682, 221, 2, 'ultimele-7-zile'),
(683, 220, 2, 'Ultimele 7 zile'),
(684, 219, 2, 'astazi'),
(685, 218, 2, 'Astazi'),
(686, 216, 2, 'Oricand'),
(687, 215, 2, 'top-votate'),
(688, 214, 2, 'top-favorite'),
(689, 213, 2, 'top-descarcate'),
(690, 212, 2, 'populare'),
(691, 211, 2, 'recente'),
(692, 210, 2, 'Top Votate'),
(693, 209, 2, 'Top Favorite'),
(694, 208, 2, 'Top Descarcate'),
(695, 207, 2, 'Populare'),
(696, 206, 2, 'Recente'),
(697, 205, 2, 'hd {category} wallpaper,full hd {category} wallpaper,hd {category} wallpapere'),
(698, 204, 2, 'Descarca wallpapere in HD {category}'),
(699, 203, 2, '{category} Wallpapere'),
(700, 202, 2, '{category} Wallpapere'),
(701, 201, 2, 'hd {resolution},full hd {resolution},hd {resolution} wallpapers'),
(702, 200, 2, 'Descarca wallpapere in HD {resolution}'),
(703, 199, 2, '{resolution} Wallpapere'),
(704, 198, 2, '{resolution} Wallpapere'),
(705, 197, 2, '{number} wallpaper'),
(706, 196, 2, '{number} wallpapere'),
(707, 195, 2, '{resolution} Wallpapere'),
(708, 194, 2, '{category} Wallpapere'),
(709, 193, 2, 'Descarca {category} wallpapere'),
(710, 192, 2, '{wallpaper} Wallpaper'),
(711, 191, 2, '{wallpaper} Wallpaper'),
(712, 190, 2, '{wallpaper} Wallpaper'),
(713, 189, 2, 'downloaduri'),
(714, 188, 2, 'vizualizari'),
(715, 187, 2, 'Astazi:'),
(716, 186, 2, 'Total favorite:'),
(717, 185, 2, 'Total downloaduri:'),
(718, 184, 2, 'Total vizualizari:'),
(719, 183, 2, 'Te rugam sa astepti...'),
(720, 182, 2, 'Adauga'),
(721, 181, 2, 'Salveaza ca ciorna'),
(722, 180, 2, 'Cuvinte cheie (META)'),
(723, 179, 2, 'Descriere (META)'),
(724, 178, 2, 'Titlu (META)'),
(725, 177, 2, 'Nu'),
(726, 176, 2, 'Da'),
(727, 175, 2, 'Featured?'),
(728, 174, 2, 'Data de publicare'),
(729, 173, 2, 'Taguri (despartite prin virgula)'),
(730, 172, 2, 'Descriere'),
(731, 171, 2, 'Website autor'),
(732, 170, 2, 'Nume autor'),
(733, 169, 2, 'Licenta'),
(734, 168, 2, 'selecteaza mai multe categorii'),
(735, 167, 2, '- selecteaza -'),
(736, 166, 2, 'Categorie parinte'),
(737, 165, 2, 'Titlu'),
(738, 164, 2, 'Parola noua'),
(739, 163, 2, 'Confirmare inregistrare'),
(740, 162, 2, 'Pentru a vedea mesajul, vă rugăm să folosiți un vizualizator de e-mail compatibil HTML!'),
(741, 161, 2, 'Sigur stergi acest wallpaper?'),
(742, 160, 2, 'Sistemul a fost în imposibilitatea de a șterge acest wallpaper'),
(743, 159, 2, 'Wallpaperul a fost sters cu succes'),
(744, 158, 2, 'Vă mulțumim. Vă rugăm să așteptați câteva zile pentru a răspunde.'),
(745, 157, 2, 'Dezarhivare...'),
(746, 156, 2, 'Imaginile se sterg...'),
(747, 155, 2, 'Imaginile se incarca...'),
(748, 154, 2, 'Wallpaperul a fost actualizat cu succes!'),
(749, 153, 2, 'Wallpaperul a fost adaugat cu succes!'),
(750, 152, 2, '{images} imagini au fost dezarhivate cu succes!'),
(751, 151, 2, 'Adaugarea este permisa doar pentru membri'),
(752, 150, 2, 'Toate imaginile au fost sterse'),
(753, 149, 2, 'Imaginea a fost stearsa'),
(754, 148, 2, 'Parola noua a fost setata. Acum te poti autentifica.'),
(755, 147, 2, 'Noua parola a fost trimisa. Verifica adresa de email!'),
(756, 146, 2, 'Contul a fost create cu succes'),
(757, 145, 2, 'Verifica adresa de email si confirma contul.'),
(758, 144, 2, 'Ne pare foarte rău, dar momentan site-ul nostru este indisponibil. Vă rugăm să reveniți mai târziu.'),
(759, 143, 2, 'Succes!'),
(760, 142, 2, 'Mesajul este obligatoriu'),
(761, 141, 2, 'URL invalid'),
(762, 140, 2, 'Subiectul este obiligatoriu'),
(763, 139, 2, 'Imposibil de actualizat wallpaperul'),
(764, 138, 2, 'Imposibil de adaugat wallpaperul'),
(765, 137, 2, 'cuvantul cheie {keyword} este prea scurt'),
(766, 136, 2, 'Meta descrierea este prea scurta'),
(767, 135, 2, 'Data publicarii trebuie sa fie mai mare sau aceeasi cu data de astazi'),
(768, 134, 2, 'Meta titlul este prea scurt'),
(769, 133, 2, '{tag} este prea scurt'),
(770, 132, 2, 'Descrierea este prea scurta'),
(771, 131, 2, 'URL autor invalid'),
(772, 130, 2, 'Nume autor prea scurt'),
(773, 129, 2, 'Licenta invalida'),
(774, 128, 2, 'Categorie invalida'),
(775, 127, 2, 'Licenta este obligatorie'),
(776, 126, 2, 'Categoria parinte este obligatorie'),
(777, 125, 2, 'Titlul este prea scurt'),
(778, 124, 2, 'Titlul este obligatoriu'),
(779, 123, 2, 'Nu se poate face actiunea!'),
(780, 122, 2, 'Imposibil de deschis arhiva!'),
(781, 121, 2, 'Selecteaza o arhiva zip inainte...'),
(782, 120, 2, '{name} nu este imagine!'),
(783, 119, 2, 'Rezolutia {name} este invalida'),
(784, 118, 2, 'Selecteaza o imagine inainte...'),
(785, 117, 2, 'Pentru a putea adauga wallpapere trebuie sa fi logat'),
(786, 116, 2, 'Nu s-a putut salva parola noua. Incearca mai tarziu.'),
(787, 115, 2, 'Cheie de confirmare invalida!'),
(788, 114, 2, 'Nu s-a putut trimite parola noua. Incearca mai tarziu.'),
(789, 113, 2, 'Nu s-a putut face inregistrarea. Incearca mai tarziu.'),
(790, 112, 2, 'Parolele nu sunt la fel'),
(791, 111, 2, 'Rescrie parola'),
(792, 110, 2, 'Caractere invalide la parola! Permise: litere,cifre,underscore.'),
(793, 109, 2, 'Parola este obligatorie!'),
(794, 108, 2, 'Aceasta adresa de email nu exista!'),
(795, 107, 2, 'Aceasta adresa de email exista deja!'),
(796, 106, 2, 'Adresa de email este invalida!'),
(797, 105, 2, 'Adresa de email este obligatorie!'),
(798, 104, 2, 'Acest username exista deja!'),
(799, 103, 2, 'Caractere invalide la username! Permise: litere,cifre,underscore.'),
(800, 102, 2, 'Username-ul este obligatoriu!'),
(801, 101, 2, 'Codul de securitate este invalid'),
(802, 100, 2, 'Codul de securitate este obligatoriu'),
(803, 99, 2, 'Autentificarea nu s-a putut realiza! Incearca mai tarziu!'),
(804, 98, 2, 'Acest cont a fost inchis!'),
(805, 97, 2, 'Contul tau a fost suspendat!'),
(806, 96, 2, 'Verifica adresa de email! Ti-am trimis o cheie de confirmare!'),
(807, 95, 2, 'Username sau parola sunt invalide'),
(808, 94, 2, 'Parola este obligatorie!'),
(809, 93, 2, 'Username sau adresa de email este obligatorie!'),
(810, 92, 2, 'Contul tau a fost activat cu succes! Acum te poti autentifica.'),
(811, 91, 2, 'Cheia de confirmare este invalida'),
(812, 90, 2, 'Confirmare inregistrare'),
(813, 89, 2, 'Wallpapere similare'),
(814, 88, 2, 'hd {wallpaper} wallpaper,full hd {wallpaper} wallpaper,{category} hd wallpapers'),
(815, 87, 2, 'Descarca {wallpaper} Wallpaper.'),
(816, 86, 2, '{wallpaper} HD Wallpaper - {category} Wallpapers'),
(817, 85, 2, 'Taguri:'),
(818, 84, 2, '{resolution} pentru {wallpaper} wallpaper'),
(819, 83, 2, 'Rezolutii disponibile'),
(820, 82, 2, 'Statistici:'),
(821, 81, 2, 'Licenta:'),
(822, 80, 2, 'Adaugat de:'),
(823, 79, 2, 'Categorie:'),
(824, 78, 2, 'F d, Y'),
(825, 77, 2, 'Data adaugarii:'),
(826, 76, 2, 'nu au fost gasite wallpapere'),
(827, 75, 2, 'Esti sigur?'),
(828, 74, 2, 'înălțime'),
(829, 73, 2, 'lățime'),
(830, 72, 2, 'Tip'),
(831, 71, 2, 'Nume'),
(832, 70, 2, 'Detalii wallpaper'),
(833, 69, 2, '» Incarca <b>doar arhive .zip</b>\r\n<br>\r\n» Arhiva trebuie sa contina doar imagini <b>(jpg or png plasate in directorul de radacina)</b> care se potrivesc cu rezolutiile disponibile\r\n<br>'),
(834, 68, 2, 'vezi rezolutiile {resolution_name}'),
(835, 67, 2, 'Lista cu rezolutii compatibile'),
(836, 66, 2, 'Trimite imaginile'),
(837, 65, 2, 'Upload Arhiva'),
(838, 64, 2, 'Upload Wallpapere'),
(839, 63, 2, 'Wallpapere Featured'),
(840, 62, 2, 'Salutare,'),
(841, 61, 2, 'Setari si Preferinte'),
(842, 59, 2, 'Wallpaperele mele'),
(843, 58, 2, 'Upload Wallpapere'),
(844, 57, 2, 'Ne pare rău, dar în acest moment nu se accepta noi utilizatori. Mulțumim de intelegere.'),
(845, 56, 2, 'Recuperare parola'),
(846, 55, 2, 'Login'),
(847, 54, 2, 'Inregistrarea nu este disponibila'),
(848, 53, 2, 'Inregistrare'),
(849, 52, 2, 'Creaza cont nou'),
(850, 51, 2, 'Genereaza parola noua'),
(851, 50, 2, 'Autentificare'),
(852, 49, 2, 'Scrie codul de securitate:'),
(853, 48, 2, 'Tine-ma minte'),
(854, 47, 2, 'Rescrie parola'),
(855, 46, 2, 'Parola'),
(856, 45, 2, 'Adresa de email'),
(857, 44, 2, 'Username'),
(858, 43, 2, 'Username / Adresa de email'),
(859, 42, 2, 'Parola uitata?'),
(860, 41, 2, 'Nu ai cont?'),
(861, 40, 2, 'Login'),
(862, 39, 2, 'Ne pare rău ... dar aceasta pagina nu este disponibilă.'),
(863, 38, 2, 'Ooops ...Pagina solicitată nu a fost găsită!'),
(864, 37, 2, 'Inregistrare'),
(865, 36, 2, 'Logout'),
(866, 35, 2, 'Autentificare'),
(867, 34, 2, 'Wallpapere pentru:'),
(868, 33, 2, 'Filtre globale'),
(869, 32, 2, 'Reseteaza filtrele'),
(870, 31, 2, 'Seteaza filtru si aplica global'),
(871, 30, 2, 'Rezolutia ta este:'),
(872, 29, 2, 'Rezolutii'),
(873, 28, 2, 'Categorii'),
(874, 27, 2, 'Top wallpapere votate'),
(875, 26, 2, 'Top wallpaper favorite'),
(876, 25, 2, 'Top wallpapere descarcate'),
(877, 24, 2, 'Wallpaper populare'),
(878, 23, 2, 'Wallpapere recente'),
(879, 22, 2, 'creat de'),
(880, 21, 2, '© 2011 phpwallpaperscript.com - unele drepturi rezervate'),
(881, 20, 2, 'Harta site'),
(882, 19, 2, 'Contact'),
(883, 18, 2, 'Feed RSS'),
(884, 17, 2, 'Locatie curenta:'),
(885, 16, 2, 'Administrare'),
(886, 15, 2, 'cauta wallpapere...'),
(887, 14, 2, 'Cautare avansata'),
(888, 13, 2, 'Adauga wallpaper'),
(889, 9, 2, 'Taguri'),
(890, 8, 2, 'Taguri'),
(891, 7, 2, 'Topuri'),
(892, 6, 2, 'Home'),
(893, 5, 2, 'php wallpaper script,wallpaper script'),
(894, 4, 2, 'phpWallpaperScript demo'),
(895, 3, 2, 'PHP Wallpaper Script'),
(896, 2, 2, '- phpWallpaperScript'),
(897, 1, 2, 'phpWallpaperScript');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_routes`
--

CREATE TABLE `hdwallsite_configs_routes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `route` varchar(255) NOT NULL,
  `ord` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_routes`
--

INSERT INTO `hdwallsite_configs_routes` (`id`, `name`, `route`, `ord`) VALUES
(1, 'wallpaper_preview', 'wallpaper/preview/$1/$2/$3/$4', 1),
(2, 'resolutions', 'resolutions', 2),
(3, 'resolution', 'resolutions/view_resolution/$1/0', 3),
(4, 'resolutionpage', 'resolutions/view_resolution/$1/$2', 4),
(5, 'profile', 'community/profile/$1', 5),
(6, 'profilestats', 'community/profile/$1/$2', 6),
(7, 'profilestats_pag', 'community/profile/$1/$2/$3', 7),
(8, 'image_preview', 'image_generator/resolution/$1/$2/$3/$4', 8),
(9, 'image_thumb_small', 'image_generator/thumb/$1/$2', 9),
(10, 'image_thumb_big', 'image_generator/preview/$1/$2', 10),
(11, 'tag', 'tags/view_tag/$1', 11),
(12, 'tagpagination', 'tags/view_tag/$1/$2', 12),
(13, 'tagcloud', 'tags/cloud', 13),
(14, 'login', 'login', 14),
(15, 'logout', 'logout', 15),
(16, 'register', 'register', 16),
(17, 'registration_confirmation', 'register/confirm/$1', 17),
(18, 'forgotpwd', 'forgot_password', 18),
(19, 'forgotpwd_confirm', 'forgot_password/confirm_change/$1', 19),
(20, 'account', 'account', 20),
(21, 'search', 'search', 21),
(22, 'searchpagination', 'search', 22),
(23, 'advsearch', 'search/advanced', 23),
(24, 'advsearchpagination', 'search/advanced', 24),
(25, 'latestw', 'tops/latest', 25),
(26, 'latestwpage', 'tops/latest/$1', 26),
(27, 'latestwtime', 'tops/latest/0/$1', 27),
(28, 'latestwtimepage', 'tops/latest/$2/$1', 28),
(29, 'popularw', 'tops/popular', 29),
(30, 'popularwpage', 'tops/popular/$1', 30),
(31, 'popularwtime', 'tops/popular/0/$1', 31),
(32, 'popularwtimepage', 'tops/popular/$2/$1', 32),
(33, 'downloadedw', 'tops/top_downloaded', 33),
(34, 'downloadedwpage', 'tops/top_downloaded/$1', 34),
(35, 'downloadedwtime', 'tops/top_downloaded/0/$1', 35),
(36, 'downloadedwtimepage', 'tops/top_downloaded/$2/$1', 36),
(37, 'favouritesw', 'tops/top_favourite', 37),
(38, 'favouriteswpage', 'tops/top_favourite/$1', 38),
(39, 'favouriteswtime', 'tops/top_favourite/0/$1', 39),
(40, 'favouriteswtimepage', 'tops/top_favourite/$2/$1', 40),
(41, 'ratingsw', 'tops/top_ratings', 41),
(42, 'ratingswpage', 'tops/top_ratings/$1', 42),
(43, 'ratingswtime', 'tops/top_ratings/0/$1', 43),
(44, 'ratingswtimepage', 'tops/top_ratings/$2/$1', 44),
(45, 'rsstops', 'rss/tops/$1/all', 45),
(46, 'rsstopstime', 'rss/tops/$1/$2', 46),
(47, 'community', 'community', 47),
(48, 'communitypagination', 'community/$1', 48),
(49, 'submit', 'submit', 49),
(50, 'submitparams', 'submit/$1', 50),
(51, 'rssfeeds', 'rss', 51),
(52, 'contact', 'contact', 52),
(53, 'sitemap', 'sitemap', 53),
(54, 'wallpaper', 'wallpaper/$1/$2/$3', 54),
(55, 'catpage', 'category/$1/$2', 55),
(56, 'rsscat', 'rss/category/$1', 56),
(57, 'rssresolution', 'rss/resolution/$1', 57),
(58, 'last_route', 'category/$1', 58);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_configs_routes_t`
--

CREATE TABLE `hdwallsite_configs_routes_t` (
  `id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `pattern` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_configs_routes_t`
--

INSERT INTO `hdwallsite_configs_routes_t` (`id`, `language_id`, `route_id`, `pattern`, `slug`) VALUES
(1, 1, 1, '^preview/([a-z0-9-]+)-wallpaper-for-([a-z0-9-]+)-([0-9]+)-([0-9]+).htm$', '/preview/{wallpaper_title}-wallpaper-for-{resolution}-{resolution_id}-{wallpaper_id}.htm'),
(2, 1, 2, '^resolutions$', '/resolutions'),
(3, 1, 3, '^resolutions/([a-zA-Z0-9-]+)-wallpapers$', '/resolutions/{resolution_slug}-wallpapers'),
(4, 1, 4, '^resolutions/([a-zA-Z0-9-]+)-wallpapers/page-([0-9]+)$', '/resolutions/{resolution_slug}-wallpapers/page-{pageno}'),
(5, 1, 5, '^profile/([a-zA-Z0-9-]+)$', '/profile/{username}'),
(6, 1, 6, '^profile/([a-zA-Z0-9-]+)/([a-zA-Z0-9-]+)$', '/profile/{username}/{stat}'),
(7, 1, 7, '^profile/([a-zA-Z0-9-]+)/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/profile/{username}/{stat}/page-{pageno}'),
(8, 1, 8, '^images/([a-z0-9-]+)-wallpaper-for-([a-z0-9-]+)-([0-9]+)-([0-9]+).jpg$', '/images/{wallpaper}-wallpaper-for-{resolution}-{resolution_id}-{wallpaper_id}.jpg'),
(9, 1, 9, '^thumbs/([a-z0-9-]+)-([0-9]+).jpg', '/thumbs/{wallpaper}-{wallpaper_id}.jpg'),
(10, 1, 10, '^previews/([a-z0-9-]+)-([0-9]+).jpg', '/previews/{wallpaper}-{wallpaper_id}.jpg'),
(11, 1, 11, '^tags/([a-zA-Z0-9-]+)$', '/tags/{tag}'),
(12, 1, 12, '^tags/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/tags/{tag}/page-{pageno}'),
(13, 1, 13, '^tags$', '/tags'),
(14, 1, 14, '^login$', '/login'),
(15, 1, 15, '^logout$', '/logout'),
(16, 1, 16, '^register$', '/register'),
(17, 1, 17, '^registration-confirmation/([a-zA-Z0-9]+)$', '/registration-confirmation/{confirmkey}'),
(18, 1, 18, '^forgot-password$', '/forgot-password'),
(19, 1, 19, '^password-change-confirm/([a-zA-Z0-9]+)$', '/password-change-confirm/{confirmkey}'),
(20, 1, 20, '^account$', '/account'),
(21, 1, 21, '^search$', '/search?q={query}'),
(22, 1, 22, '^search$', '/search?q={query}&page={pageno}'),
(23, 1, 23, '^advanced-search$', '/advanced-search'),
(24, 1, 24, '^advanced-search$', '/advanced-search?q={query}&category={category}&resolution={resolution}&license={license}&page={pageno}'),
(25, 1, 25, '^latest-wallpapers$', '/latest-wallpapers'),
(26, 1, 26, '^latest-wallpapers/page-([0-9]+)$', '/latest-wallpapers/page-{pageno}'),
(27, 1, 27, '^latest-wallpapers/([a-zA-Z0-9-]+)$', '/latest-wallpapers/{time}'),
(28, 1, 28, '^latest-wallpapers/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/latest-wallpapers/{time}/page-{pageno}'),
(29, 1, 29, '^popular-wallpapers$', '/popular-wallpapers'),
(30, 1, 30, '^popular-wallpapers/page-([0-9]+)$', '/popular-wallpapers/page-{pageno}'),
(31, 1, 31, '^popular-wallpapers/([a-zA-Z0-9-]+)$', '/popular-wallpapers/{time}'),
(32, 1, 32, '^popular-wallpapers/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/popular-wallpapers/{time}/page-{pageno}'),
(33, 1, 33, '^top-downloaded-wallpapers$', '/top-downloaded-wallpapers'),
(34, 1, 34, '^top-downloaded-wallpapers/page-([0-9]+)$', '/top-downloaded-wallpapers/page-{pageno}'),
(35, 1, 35, '^top-downloaded-wallpapers/([a-zA-Z0-9-]+)$', '/top-downloaded-wallpapers/{time}'),
(36, 1, 36, '^top-downloaded-wallpapers/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/top-downloaded-wallpapers/{time}/page-{pageno}'),
(37, 1, 37, '^top-favourite-wallpapers$', '/top-favourite-wallpapers'),
(38, 1, 38, '^top-favourite-wallpapers/page-([0-9]+)$', '/top-favourite-wallpapers/page-{pageno}'),
(39, 1, 39, '^top-favourite-wallpapers/([a-zA-Z0-9-]+)$', '/top-favourite-wallpapers/{time}'),
(40, 1, 40, '^top-favourite-wallpapers/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/top-favourite-wallpapers/{time}/page-{pageno}'),
(41, 1, 41, '^top-rated-wallpapers$', '/top-rated-wallpapers'),
(42, 1, 42, '^top-rated-wallpapers/page-([0-9]+)$', '/top-rated-wallpapers/page-{pageno}'),
(43, 1, 43, '^top-rated-wallpapers/([a-zA-Z0-9-]+)$', '/top-rated-wallpapers/{time}'),
(44, 1, 44, '^top-rated-wallpapers/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/top-rated-wallpapers/{time}/page-{pageno}'),
(45, 1, 45, '^rss/tops/([a-zA-Z0-9-]+)$', '/rss/tops/{filter}'),
(46, 1, 46, '^rss/tops/([a-zA-Z0-9-]+)/([a-zA-Z0-9-]+)$', '/rss/tops/{filter}/{time}'),
(47, 1, 47, '^community$', '/community'),
(48, 1, 48, '^community/page-([0-9]+)$', '/community/page-{pageno}'),
(49, 1, 49, '^submit$', '/submit'),
(50, 1, 50, '^submit/([a-zA-Z_]+)$', ''),
(51, 1, 51, '^rss$', '/rss'),
(52, 1, 52, '^contact$', '/contact'),
(53, 1, 53, '^sitemap$', '/sitemap'),
(54, 1, 54, '^(.*)/([a-zA-Z0-9-]+)-([0-9]+).htm$', '{category}/{wallpaper_name}-{wallpaper_id}.htm'),
(55, 1, 55, '(.*)/page-([0-9]+)', '{category}/page-{pageno}'),
(56, 1, 56, '^rss/category/(.*)$', '/rss/category/{category}'),
(57, 1, 57, '^rss/resolution/([a-zA-Z0-9-]+)$', '/rss/resolution/{resolution}'),
(58, 1, 58, '(.*)', ''),
(59, 2, 1, '^vizualizare/([a-z0-9-]+)-wallpaper-pentru-([a-z0-9-]+)-([0-9]+)-([0-9]+).htm$', '/vizualizare/{wallpaper_title}-wallpaper-pentru-{resolution}-{resolution_id}-{wallpaper_id}.htm'),
(60, 2, 2, '^rezolutii$', '/rezolutii'),
(61, 2, 3, '^rezolutii/([a-zA-Z0-9-]+)-wallpapere$', '/rezolutii/{resolution_slug}-wallpapere'),
(62, 2, 4, '^rezolutii/([a-zA-Z0-9-]+)-wallpapere/pagina-([0-9]+)$', '/resolutions/{resolution_slug}-wallpapere/pagina-{pageno}'),
(63, 2, 5, '^profil/([a-zA-Z0-9-]+)$', '/profil/{username}'),
(64, 2, 6, '^profil/([a-zA-Z0-9-]+)/([a-zA-Z0-9-]+)$', '/profil/{username}/{stat}'),
(65, 2, 7, '^profil/([a-zA-Z0-9-]+)/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/profil/{username}/{stat}/pagina-{pageno}'),
(66, 2, 8, '^imagini/([a-z0-9-]+)-wallpaper-pentru-([a-z0-9-]+)-([0-9]+)-([0-9]+).jpg$', '/imagini/{wallpaper}-wallpaper-pentru-{resolution}-{resolution_id}-{wallpaper_id}.jpg'),
(67, 2, 9, '^thumbs/([a-z0-9-]+)-([0-9]+).jpg', '/thumbs/{wallpaper}-{wallpaper_id}.jpg'),
(68, 2, 10, '^vizualizare/([a-z0-9-]+)-([0-9]+).jpg', '/vizualizare/{wallpaper}-{wallpaper_id}.jpg'),
(69, 2, 11, '^taguri/([a-zA-Z0-9-]+)$', '/taguri/{tag}'),
(70, 2, 12, '^tags/([a-zA-Z0-9-]+)/page-([0-9]+)$', '/tags/{tag}/page-{pageno}'),
(71, 2, 13, '^taguri$', '/taguri'),
(72, 2, 14, '^autentificare$', '/autentificare'),
(73, 2, 15, '^iesire$', '/iesire'),
(74, 2, 16, '^inregistrare$', '/inregistrare'),
(75, 2, 17, '^confirmare-inregistrare/([a-zA-Z0-9]+)$', '/confirmare-inregistrare/{confirmkey}'),
(76, 2, 18, '^parola-uitata$', '/parola-uitata'),
(77, 2, 19, '^confirmare-schimbare-parola/([a-zA-Z0-9]+)$', '/confirmare-schimbare-parola/{confirmkey}'),
(78, 2, 20, '^cont$', '/cont'),
(79, 2, 21, '^cauta$', '/cauta?q={query}'),
(80, 2, 22, '^cauta$', '/cauta?q={query}&page={pageno}'),
(81, 2, 23, '^cautare-avansata$', '/cautare-avansata'),
(82, 2, 24, '^cautare-avansata$', '/cautare-avansata?q={query}&category={category}&resolution={resolution}&license={license}&page={pageno}'),
(83, 2, 25, '^ultimele-wallpapere$', '/ultimele-wallpapere'),
(84, 2, 26, '^ultimele-wallpapere/pagina-([0-9]+)$', '/ultimele-wallpapere/pagina-{pageno}'),
(85, 2, 27, '^ultimele-wallpapere/([a-zA-Z0-9-]+)$', '/ultimele-wallpapere/{time}'),
(86, 2, 28, '^ultimele-wallpapere/([a-zA-Z0-9-]+)/pagina-([0-9]+)$', '/ultimele-wallpapere/{time}/pagina-{pageno}'),
(87, 2, 29, '^top-wallpapere$', '/top-wallpapere'),
(88, 2, 30, '^top-wallpapere/pagina-([0-9]+)$', '/top-wallpapere/pagina-{pageno}'),
(89, 2, 31, '^top-wallpapere/([a-zA-Z0-9-]+)$', '/top-wallpapere/{time}'),
(90, 2, 32, '^top-wallpapere/([a-zA-Z0-9-]+)/pagina-([0-9]+)$', '/top-wallpapere/{time}/pagina-{pageno}'),
(91, 2, 33, '^top-wallpapere-descarcate$', '/top-wallpapere-descarcate'),
(92, 2, 34, '^top-wallpapere-descarcate/pagina-([0-9]+)$', '/top-wallpapere-descarcate/pagina-{pageno}'),
(93, 2, 35, '^top-wallpapere-descarcate/([a-zA-Z0-9-]+)$', '/top-wallpapere-descarcate/{time}'),
(94, 2, 36, '^top-wallpapere-descarcate/([a-zA-Z0-9-]+)/pagina-([0-9]+)$', '/top-wallpapere-descarcate/{time}/pagina-{pageno}'),
(95, 2, 37, '^top-wallpapere-favorite$', '/top-wallpapere-favorite'),
(96, 2, 38, '^top-wallpapere-favorite/pagina-([0-9]+)$', '/top-wallpapere-favorite/pagina-{pageno}'),
(97, 2, 39, '^top-wallpapere-favorite/([a-zA-Z0-9-]+)$', '/top-wallpapere-favorite/{time}'),
(98, 2, 40, '^top-wallpapere-favorite/([a-zA-Z0-9-]+)/pagina-([0-9]+)$', '/top-wallpapere-favorite/{time}/pagina-{pageno}'),
(99, 2, 41, '^top-wallpapere-votate$', '/top-wallpapere-votate'),
(100, 2, 42, '^top-wallpapere-votate/pagina-([0-9]+)$', '/top-wallpapere-votate/pagina-{pageno}'),
(101, 2, 43, '^top-wallpapere-votate/([a-zA-Z0-9-]+)$', '/top-wallpapere-votate/{time}'),
(102, 2, 44, '^top-wallpapere-votate/([a-zA-Z0-9-]+)/pagina-([0-9]+)$', '/top-wallpapere-votate/{time}/pagina-{pageno}'),
(103, 2, 45, '^rss/tops/([a-zA-Z0-9-]+)$', '/rss/tops/{filter}'),
(104, 2, 46, '^rss/tops/([a-zA-Z0-9-]+)/([a-zA-Z0-9-]+)$', '/rss/tops/{filter}/{time}'),
(105, 2, 47, '^comunitate$', '/comunitate'),
(106, 2, 48, '^comunitate/pagina-([0-9]+)$', '/comunitate/pagina-{pageno}'),
(107, 2, 49, '^upload-wallpaper$', '/upload-wallpaper'),
(108, 2, 50, '^upload-wallpaper/([a-zA-Z_]+)$', ''),
(109, 2, 51, '^rss$', '/rss'),
(110, 2, 52, '^contact$', '/contact'),
(111, 2, 53, '^sitemap$', '/sitemap'),
(112, 2, 54, '^(.*)/([a-zA-Z0-9-]+)-([0-9]+).htm$', '{category}/{wallpaper_name}-{wallpaper_id}.htm'),
(113, 2, 55, '(.*)/pagina-([0-9]+)', '{category}/pagina-{pageno}'),
(114, 2, 56, '^rss/categorie/(.*)$', '/rss/categorie/{category}'),
(115, 2, 57, '^rss/rezolutie/([a-zA-Z0-9-]+)$', '/rss/rezolutie/{resolution}'),
(116, 2, 58, '(.*)', '');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_licenses`
--

CREATE TABLE `hdwallsite_licenses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `sortorder` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_licenses`
--

INSERT INTO `hdwallsite_licenses` (`id`, `name`, `url`, `sortorder`) VALUES
(8, 'Creative Commons Attribution License', 'http://creativecommons.org/licenses/by/3.0/', 3),
(9, 'Creative Commons Attribution-NoDerivs License', 'http://creativecommons.org/licenses/by-nd/3.0/', 2),
(10, 'Creative Commons Attribution-NonCommercial-NoDerivs License', 'http://creativecommons.org/licenses/by-nc-nd/3.0/', 1),
(11, 'Creative Commons Attribution-NonCommercial License', 'http://creativecommons.org/licenses/by-nc/3.0/', 6),
(12, 'Creative Commons Attribution-NonCommercial-ShareAlike License', 'http://creativecommons.org/licenses/by-nc-sa/3.0/', 4),
(13, 'Creative Commons Attribution-ShareAlike License', 'http://creativecommons.org/licenses/by-sa/3.0/', 5),
(25, 'Free for personal desktop use', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_mod_admanager`
--

CREATE TABLE `hdwallsite_mod_admanager` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_mod_admanager`
--

INSERT INTO `hdwallsite_mod_admanager` (`id`, `name`, `slug`, `width`, `height`, `content`) VALUES
(1, '160x800', '160x800', 160, 800, 'QWQ=');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_mod_linkmanager_links`
--

CREATE TABLE `hdwallsite_mod_linkmanager_links` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `ord` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_mod_linkmanager_sections`
--

CREATE TABLE `hdwallsite_mod_linkmanager_sections` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_mod_linkmanager_sections`
--

INSERT INTO `hdwallsite_mod_linkmanager_sections` (`id`, `name`) VALUES
(1, 'Footer');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_resolutions`
--

CREATE TABLE `hdwallsite_resolutions` (
  `id` int(11) NOT NULL,
  `typeid` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `page_title` varchar(255) DEFAULT NULL,
  `page_description` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `sortorder` int(11) NOT NULL,
  `sidebar` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_resolutions`
--

INSERT INTO `hdwallsite_resolutions` (`id`, `typeid`, `name`, `slug`, `width`, `height`, `page_title`, `page_description`, `meta_title`, `meta_description`, `meta_keywords`, `sortorder`, `sidebar`) VALUES
(1, 5, '320 x 480 iPhone', '320x480-iphone', 320, 480, '320 x 480 Resolution | iPhone 3 | Nokia | Samsung | HD Wallpapers.site', 'Get 320p and 320 x 480 Resolution Wallpapers.iPhone 3,Nokia 7210,Nokia 5230,Samsung Mobile,HD and Widescreen Wallpapers free download from HDWallpapers.site', '320 x 480 Resolution | iPhone 3 | Nokia | Samsung | HD Wallpapers.site', 'Get 320p and 320 x 480 Resolution Wallpapers.iPhone 3,Nokia 7210,Nokia 5230,Samsung Mobile,HD and Widescreen Wallpapers free download from HDWallpapers.site', '320 x 480,resolution,hd,wide,wallpapers,iphone 3,samsung,nokia,mobile wallpapers,hdtv,hdwallpapers.site', 1, 0),
(2, 1, '1024 x 768', '1024x768', 1024, 768, NULL, NULL, NULL, NULL, NULL, 4, 8),
(3, 1, '1600 x 1200', '1600x1200', 1600, 1200, NULL, NULL, NULL, NULL, NULL, 7, 12),
(4, 1, '1920 x 1440', '1920x1440', 1920, 1440, NULL, NULL, NULL, NULL, NULL, 8, 13),
(5, 2, '1280 x 1024', '1280x1024', 1280, 1024, NULL, NULL, NULL, NULL, NULL, 6, 10),
(7, 4, '1280 x 800 widescreen', '1280x800-widescreen', 1280, 800, NULL, NULL, NULL, NULL, NULL, 10, 16),
(8, 4, '1440 x 900 widescreen', '1440x900-widescreen', 1440, 900, NULL, NULL, NULL, NULL, NULL, 11, 17),
(9, 3, '1600 x 900 HDTV', '1600x900-hdtv', 1600, 900, NULL, NULL, NULL, NULL, NULL, 17, 24),
(10, 4, '1680 x 1050 widescreen', '1680x1050-widescreen', 1680, 1050, NULL, NULL, NULL, NULL, NULL, 12, 18),
(11, 4, '1920 x 1200 widescreen', '1920x1200-widescreen', 1920, 1200, NULL, NULL, NULL, NULL, NULL, 13, 19),
(12, 4, '2560 x 1600 widescreen', '2560x1600-widescreen', 2560, 1600, NULL, NULL, NULL, NULL, NULL, 14, 20),
(13, 3, '1280 x 720 HDTV 720p', '1280x720-hdtv-720p', 1280, 720, NULL, NULL, NULL, NULL, NULL, 15, 22),
(14, 3, '1366 x 768 HDTV', '1366x768-hdtv', 1366, 768, NULL, NULL, NULL, NULL, NULL, 16, 23),
(15, 3, '1920 x 1080 HDTV 1080p', '1920x1080-hdtv-1080p', 1920, 1080, NULL, NULL, NULL, NULL, NULL, 18, 25),
(26, 1, '2560 x 1920', '2560x1920', 2560, 1920, NULL, NULL, NULL, NULL, NULL, 9, 14),
(27, 3, '2560 x 1440 HDTV', '2560x1440-hdtv', 2560, 1440, NULL, NULL, NULL, NULL, NULL, 19, 26),
(33, 1, '1152 x 864', '1152x864', 1152, 864, NULL, NULL, NULL, NULL, NULL, 5, 9),
(34, 5, '640 x 960 iPhone 4', '640x960-iphone-4', 640, 960, '640 x 960 Resolution | iPhone 4 and iPhone 4S | HD Wallpapers.Site', 'Get 640p and 640 x 960 Resolution Wallpapers.iPhone 4 and iPhone 4S, Samsung,Microsoft and Nokia Smartphone HD and Wide Wallpapers .Free Download From hdwallpapers.site', '640 x 960 Resolution | iPhone 4 and iPhone 4S | HD Wallpapers.Site', 'Get 640p and 640 x 960 Resolution Wallpapers.iPhone 4 and iPhone 4S, Samsung,Microsoft and Nokia Smartphone HD and Wide Wallpapers .Free Download From hdwallpapers.site', '640 x 960,resolution,hd,smartphone,wallpapers,wide,iphone 4,iphone 4s,samsung,nokia,microsoft,hdwallpapers.site', 2, 1),
(38, 4, '1024 x 640 widescreen', '1024x640-widescreen', 1024, 640, NULL, NULL, NULL, NULL, NULL, 0, 15),
(39, 1, '800 x 600', '800x600', 800, 600, NULL, NULL, NULL, NULL, NULL, 0, 7),
(40, 1, '1400 x 1050', '1400x1050', 1400, 1050, NULL, NULL, NULL, NULL, NULL, 0, 11),
(41, 4, '2880 x 1800 Retina Display', '2880x1800-retina-display', 2880, 1800, NULL, NULL, NULL, NULL, NULL, 0, 21),
(46, 5, '640 x 1136 iPhone 5', '640x1136-iphone-5', 640, 1136, '640 x 1136 Resolution | iPhone 5 and iPhone 5S | HD Wallpapers.Site', 'Get 640 x 1136 Resolution Wallpapers. iPhone 5 and iPhone 5S HD, Mobile and Widescreen Wallpapers Free Download on HDWallpapers.site.', '640 x 1136 Resolution | iPhone 5 and iPhone 5S | HD Wallpapers.Site', 'Get 640 x 1136 Resolution Wallpapers. iPhone 5 and iPhone 5S HD, Mobile and Widescreen Wallpapers Free Download on HDWallpapers.site.', '640 x 1136,Resolution,hd,wallpapers,hdwallpapers.site,iphone 5 wallpapers,iphone 5s wallpapers,wide,widescreen,mobile,hdtv', 0, 2),
(47, 5, '750 x 1334 iPhone 6S', '750x1334-iphone-6s', 750, 1334, '750 x 1334 Resolution | iPhone 6 and iPhone 6S | HD Wallpapers.Site', 'Get 720p and 750 x 1334 Resolution HD Wallpapers. iPhone 6 and iPhone 6S HD and Widescreen Wallpapers Free Download on HDWallpapers.site.', '750 x 1334 Resolution | iPhone 6 and iPhone 6S | HD Wallpapers.Site', 'Get 720p and 750 x 1334 Resolution HD Wallpapers. iPhone 6 and iPhone 6S HD and Widescreen Wallpapers Free Download on HDWallpapers.site.', '720p,750 x 1334,hd,wallpapers,hdwallpapers.site,iphone 6 wallpapers,iphone 6s wallpapers,wide,widescreen,hdtv', 0, 3),
(48, 5, '1080 x 1920 iPhone 6S Plus', '1080x1920-iphone-6s-plus', 1080, 1920, '1080 x 1920 Resolution | iPhone 6 Plus and iPhone 6S Plus | HD Wallpapers.Site', 'Get 1080p and 1080 x 1920 Resolution HD Wallpapers. iPhone 6 Plus and iPhone 6S Plus HD and Widescreen Wallpapers Free Download on HDWallpapers.site.', '1080 x 1920 Resolution | iPhone 6S and iPhone 6S Plus | HD Wallpapers.Site', 'Get 1080p and 1080 x 1920 Resolution HD Wallpapers. iPhone 6 Plus and iPhone 6S Plus HD and Widescreen Wallpapers Free Download on HDWallpapers.site.', '1080p,1920 x 1080,hd,wallpapers,hdwallpapers.site,iphone 6 plus wallpapers,iphone 6s plus wallpapers,wide,widescreen,hdtv', 0, 4),
(49, 6, '2732 x 2048 iPad Pro', '2732x2048-ipad-pro', 2732, 2048, '2732 x 2048 Resolution | iPad Pro 12 Inch Wallpapers | HD Wallpapers.site', 'Get UHD and 2732 x 2048 Resolution Wallpapers. iPhone pro and iPhone pro 12 inch HD, Tablet and Widescreen Wallpapers Free Download from HDWallpapers.site.', '2732 x 2048 Resolution | iPad Pro 12 Inch Wallpapers | HD Wallpapers.site', 'Get UHD and 2732 x 2048 Resolution Wallpapers. iPhone pro and iPhone pro 12 inch HD, Tablet and Widescreen Wallpapers Free Download from HDWallpapers.site.', '2732 x 2048,resolution,hd,wallpapers,hdwallpapers.site,ipad pro wallpapers,iphone pro 12 inch wallpapers,wide,widescreen,tablet,hdtv', 0, 6),
(50, 6, '2048 x 1536 iPad Air 2', '2048x1536-ipad-air-2', 2048, 1536, '2048 x 1536 Resolution | iPad Air 2 | iPad Pro | HD Wallpapers.site', 'Get UHD and 2048 x 1536 Resolution Wallpapers. iPhone Air 2 and iPhone pro 9 inch HD, Tablet and Widescreen Wallpapers Free Download from HDWallpapers.site.', '2048 x 1536 Resolution | iPad Air 2 | iPad Pro | HD Wallpapers.site', 'Get UHD and 2048 x 1536 Resolution Wallpapers. iPhone Air 2 and iPhone pro 9 inch HD, Tablet and Widescreen Wallpapers Free Download from HDWallpapers.site.', '2048 x 1536,resolution,hd,wallpapers,hdwallpapers.site,ipad air wallpapers,iphone pro 9 inch wallpapers,wide,widescreen,tablet,hdtv', 0, 5);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_resolutions_types`
--

CREATE TABLE `hdwallsite_resolutions_types` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_resolutions_types`
--

INSERT INTO `hdwallsite_resolutions_types` (`id`, `name`) VALUES
(1, 'Standard 4:3'),
(2, 'Standard 5:4'),
(3, 'HD 16:9'),
(4, 'Wide 16:10'),
(5, 'iPhone'),
(6, 'iPad');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_data_downloads`
--

CREATE TABLE `hdwallsite_top_data_downloads` (
  `id` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `date_downloaded` datetime NOT NULL,
  `id_resolution` int(11) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_data_favourites`
--

CREATE TABLE `hdwallsite_top_data_favourites` (
  `id` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_data_ratings`
--

CREATE TABLE `hdwallsite_top_data_ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `i_like` int(11) NOT NULL,
  `i_dislike` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `date_voted` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_data_views`
--

CREATE TABLE `hdwallsite_top_data_views` (
  `id` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `date_viewed` datetime NOT NULL,
  `resolution_id` int(11) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_downloads`
--

CREATE TABLE `hdwallsite_top_downloads` (
  `wallpaper_id` int(11) NOT NULL,
  `all` int(11) NOT NULL DEFAULT 0,
  `today` int(11) NOT NULL DEFAULT 0,
  `last_7_days` int(11) NOT NULL DEFAULT 0,
  `last_30_days` int(11) NOT NULL DEFAULT 0,
  `this_month` int(11) NOT NULL DEFAULT 0,
  `last_month` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_favourites`
--

CREATE TABLE `hdwallsite_top_favourites` (
  `wallpaper_id` int(11) NOT NULL,
  `all` int(11) NOT NULL DEFAULT 0,
  `today` int(11) NOT NULL DEFAULT 0,
  `last_7_days` int(11) NOT NULL DEFAULT 0,
  `last_30_days` int(11) NOT NULL DEFAULT 0,
  `this_month` int(11) NOT NULL DEFAULT 0,
  `last_month` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_popular`
--

CREATE TABLE `hdwallsite_top_popular` (
  `wallpaper_id` int(11) NOT NULL,
  `all` int(11) NOT NULL DEFAULT 0,
  `today` int(11) NOT NULL DEFAULT 0,
  `last_7_days` int(11) NOT NULL DEFAULT 0,
  `last_30_days` int(11) NOT NULL DEFAULT 0,
  `this_month` int(11) NOT NULL DEFAULT 0,
  `last_month` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_top_ratings`
--

CREATE TABLE `hdwallsite_top_ratings` (
  `wallpaper_id` int(11) NOT NULL,
  `all` int(11) NOT NULL DEFAULT 0,
  `today` int(11) NOT NULL DEFAULT 0,
  `last_7_days` int(11) NOT NULL DEFAULT 0,
  `last_30_days` int(11) NOT NULL DEFAULT 0,
  `this_month` int(11) NOT NULL DEFAULT 0,
  `last_month` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users`
--

CREATE TABLE `hdwallsite_users` (
  `uid` int(11) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 0,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `total_uploads` int(11) NOT NULL DEFAULT 0,
  `total_downloads` int(11) NOT NULL DEFAULT 0,
  `total_favourites` int(11) NOT NULL DEFAULT 0,
  `date_registered` datetime DEFAULT NULL,
  `date_last_login` datetime DEFAULT NULL,
  `status` enum('active','pending','suspended','closed','email_changed','delete') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_users`
--

INSERT INTO `hdwallsite_users` (`uid`, `role_id`, `username`, `password`, `email`, `total_uploads`, `total_downloads`, `total_favourites`, `date_registered`, `date_last_login`, `status`) VALUES
(1, 1, 'admin', '602016c989b51f2d09e7bbc3c8faaefc', 'brargurshobit2009@gmail.com', 0, 0, 0, '2016-05-22 14:59:30', '2026-06-21 11:21:17', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_confirmations`
--

CREATE TABLE `hdwallsite_users_confirmations` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `hashkey` varchar(255) NOT NULL,
  `type` enum('registration','changepwd','passwordrecovery') NOT NULL,
  `params` text DEFAULT NULL,
  `created` datetime NOT NULL,
  `confirmed` datetime DEFAULT NULL,
  `status` enum('pending','confirmed') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_notifs`
--

CREATE TABLE `hdwallsite_users_notifs` (
  `user_id` int(11) NOT NULL,
  `mail_new_comment` int(11) NOT NULL DEFAULT 0,
  `mail_wall_status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_users_notifs`
--

INSERT INTO `hdwallsite_users_notifs` (`user_id`, `mail_new_comment`, `mail_wall_status`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_privacy`
--

CREATE TABLE `hdwallsite_users_privacy` (
  `user_id` int(11) NOT NULL,
  `show_author` int(11) DEFAULT 0,
  `view_profile` enum('everyone','only_me','logged_members') DEFAULT 'everyone',
  `view_contact_info` enum('everyone','only_me','logged_members') DEFAULT 'everyone',
  `view_bio` enum('everyone','only_me','logged_members') DEFAULT 'everyone',
  `view_avatar` enum('everyone','only_me','logged_members') DEFAULT 'everyone',
  `view_downloads` enum('everyone','only_me','logged_members') DEFAULT 'everyone',
  `view_favourites` enum('everyone','only_me','logged_members') DEFAULT 'everyone',
  `view_wallpapers` enum('everyone','only_me','logged_members') DEFAULT 'everyone'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_users_privacy`
--

INSERT INTO `hdwallsite_users_privacy` (`user_id`, `show_author`, `view_profile`, `view_contact_info`, `view_bio`, `view_avatar`, `view_downloads`, `view_favourites`, `view_wallpapers`) VALUES
(1, 1, 'everyone', 'everyone', 'everyone', 'everyone', 'everyone', 'everyone', 'everyone');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_profile`
--

CREATE TABLE `hdwallsite_users_profile` (
  `user_id` int(11) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `url_homepage` varchar(255) DEFAULT NULL,
  `url_blog` varchar(255) DEFAULT NULL,
  `url_twitter` varchar(255) DEFAULT NULL,
  `url_facebook` varchar(255) DEFAULT NULL,
  `url_linkedin` varchar(255) DEFAULT NULL,
  `im_icq` varchar(255) DEFAULT NULL,
  `im_aim` varchar(255) DEFAULT NULL,
  `im_msn` varchar(255) DEFAULT NULL,
  `im_yahoo` varchar(255) DEFAULT NULL,
  `im_skype` varchar(255) DEFAULT NULL,
  `biography` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interests` varchar(255) DEFAULT NULL,
  `signature` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_users_profile`
--

INSERT INTO `hdwallsite_users_profile` (`user_id`, `avatar`, `first_name`, `last_name`, `nickname`, `birthday`, `url_homepage`, `url_blog`, `url_twitter`, `url_facebook`, `url_linkedin`, `im_icq`, `im_aim`, `im_msn`, `im_yahoo`, `im_skype`, `biography`, `location`, `interests`, `signature`) VALUES
(1, '', 'Gurshobit', 'Brar', 'Guru', '1992-09-10', 'http://gurshobit.com', 'https://digitalnews.co', 'https://twitter.com/GurshobitBrar', 'https://facebook.com/GurshobitBrar', NULL, NULL, NULL, 'brargurshobit2009@hotmail.com', 'brargurshobit@ymail.com', 'brargurshobit2011', 'I am Web Developer, Designer and Freelancer. I am Simple and Kind Heart Person.', 'India', 'Movies,Smartphones and Laptops', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_roles`
--

CREATE TABLE `hdwallsite_users_roles` (
  `roleid` int(11) NOT NULL,
  `role` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `rank` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_users_roles`
--

INSERT INTO `hdwallsite_users_roles` (`roleid`, `role`, `description`, `rank`) VALUES
(1, 'admin', 'Administrator', 1),
(2, 'basic', 'Basic', 2);

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_sessions`
--

CREATE TABLE `hdwallsite_users_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `userip` varchar(255) DEFAULT NULL,
  `last_session` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `hdwallsite_users_sessions`
--

INSERT INTO `hdwallsite_users_sessions` (`id`, `user_id`, `token`, `userip`, `last_session`) VALUES
(40, 1, 'Y2MzNWIyYTgyOGNhMDkyOWNkZmY1OGQ3Y2JjM2ViYTM=', '49.201.46.169', '2016-05-22 14:59:53'),
(42, 1, 'MzBjMDUxMzEyYTg0ZWIzYjY4YmJkYTZiOWM5OWY3NTE=', '::1', '2024-01-01 13:06:56'),
(43, 1, 'NjE2MmU4YjA0NDQ4YTZjMDhlNDc0ODQyYTJmODJhNTg=', '::1', '2026-06-21 11:21:17');

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_users_stats`
--

CREATE TABLE `hdwallsite_users_stats` (
  `user_id` int(11) NOT NULL,
  `uploads_active` int(11) NOT NULL DEFAULT 0,
  `uploads_pending` int(11) NOT NULL DEFAULT 0,
  `uploads_rejected` int(11) NOT NULL DEFAULT 0,
  `uploads_disabled` int(11) NOT NULL DEFAULT 0,
  `total_likes` int(11) NOT NULL DEFAULT 0,
  `total_dislikes` int(11) NOT NULL DEFAULT 0,
  `total_comments` int(11) NOT NULL DEFAULT 0,
  `downloads_unique` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_wallpapers`
--

CREATE TABLE `hdwallsite_wallpapers` (
  `wallpaper_id` int(11) NOT NULL,
  `cat_id` int(11) NOT NULL,
  `license_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `author_name` varchar(150) DEFAULT NULL,
  `author_website` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `directory` varchar(255) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `thumb` varchar(255) NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `date_added` datetime NOT NULL,
  `date_to_publish` datetime DEFAULT NULL,
  `featured` int(11) NOT NULL DEFAULT 0,
  `rating_value` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','pending','rejected','disabled','delete','draft') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_wallpapers_categories`
--

CREATE TABLE `hdwallsite_wallpapers_categories` (
  `wallpaper_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_wallpapers_comments`
--

CREATE TABLE `hdwallsite_wallpapers_comments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `date_added` datetime NOT NULL,
  `status` enum('active','pending','rejected','disabled','spam') NOT NULL DEFAULT 'pending',
  `moderator_message` text DEFAULT NULL,
  `is_reported` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_wallpapers_comments_reported`
--

CREATE TABLE `hdwallsite_wallpapers_comments_reported` (
  `id` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `date_reported` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_wallpapers_images`
--

CREATE TABLE `hdwallsite_wallpapers_images` (
  `image_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `resolution_id` int(11) DEFAULT NULL,
  `wallpaper_id` int(11) DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `ext` varchar(50) DEFAULT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `status` enum('temp','active') NOT NULL DEFAULT 'temp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hdwallsite_wallpapers_resolutions`
--

CREATE TABLE `hdwallsite_wallpapers_resolutions` (
  `id` int(11) NOT NULL,
  `wallpaper_id` int(11) NOT NULL,
  `resolution_id` int(11) NOT NULL,
  `typeid` int(11) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `hdwallsite_categories`
--
ALTER TABLE `hdwallsite_categories`
  ADD PRIMARY KEY (`catid`);

--
-- Indexes for table `hdwallsite_configs`
--
ALTER TABLE `hdwallsite_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `param` (`param`);

--
-- Indexes for table `hdwallsite_configs_emails`
--
ALTER TABLE `hdwallsite_configs_emails`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `hdwallsite_configs_emails_t`
--
ALTER TABLE `hdwallsite_configs_emails_t`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_id` (`email_id`),
  ADD KEY `language_id` (`language_id`);

--
-- Indexes for table `hdwallsite_configs_lang`
--
ALTER TABLE `hdwallsite_configs_lang`
  ADD PRIMARY KEY (`langid`);

--
-- Indexes for table `hdwallsite_configs_lang_p`
--
ALTER TABLE `hdwallsite_configs_lang_p`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `param` (`param`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `hdwallsite_configs_lang_s`
--
ALTER TABLE `hdwallsite_configs_lang_s`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hdwallsite_configs_lang_t`
--
ALTER TABLE `hdwallsite_configs_lang_t`
  ADD PRIMARY KEY (`id`,`param_id`,`language_id`),
  ADD KEY `language_id` (`language_id`),
  ADD KEY `param_id` (`param_id`);

--
-- Indexes for table `hdwallsite_configs_routes`
--
ALTER TABLE `hdwallsite_configs_routes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `hdwallsite_configs_routes_t`
--
ALTER TABLE `hdwallsite_configs_routes_t`
  ADD PRIMARY KEY (`id`),
  ADD KEY `language_id` (`language_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Indexes for table `hdwallsite_licenses`
--
ALTER TABLE `hdwallsite_licenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hdwallsite_mod_admanager`
--
ALTER TABLE `hdwallsite_mod_admanager`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `hdwallsite_mod_linkmanager_links`
--
ALTER TABLE `hdwallsite_mod_linkmanager_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `ord` (`ord`);

--
-- Indexes for table `hdwallsite_mod_linkmanager_sections`
--
ALTER TABLE `hdwallsite_mod_linkmanager_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hdwallsite_resolutions`
--
ALTER TABLE `hdwallsite_resolutions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `typeid` (`typeid`),
  ADD KEY `slug` (`slug`),
  ADD KEY `sortorder` (`sortorder`),
  ADD KEY `sidebar` (`sidebar`);

--
-- Indexes for table `hdwallsite_resolutions_types`
--
ALTER TABLE `hdwallsite_resolutions_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hdwallsite_top_data_downloads`
--
ALTER TABLE `hdwallsite_top_data_downloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `date_downloaded` (`date_downloaded`),
  ADD KEY `id_resolution` (`id_resolution`);

--
-- Indexes for table `hdwallsite_top_data_favourites`
--
ALTER TABLE `hdwallsite_top_data_favourites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`),
  ADD KEY `date_added` (`date_added`);

--
-- Indexes for table `hdwallsite_top_data_ratings`
--
ALTER TABLE `hdwallsite_top_data_ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `i_like` (`i_like`),
  ADD KEY `i_dislike` (`i_dislike`),
  ADD KEY `date_voted` (`date_voted`);

--
-- Indexes for table `hdwallsite_top_data_views`
--
ALTER TABLE `hdwallsite_top_data_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `resolution_id` (`resolution_id`);

--
-- Indexes for table `hdwallsite_top_downloads`
--
ALTER TABLE `hdwallsite_top_downloads`
  ADD PRIMARY KEY (`wallpaper_id`),
  ADD KEY `all` (`all`),
  ADD KEY `today` (`today`),
  ADD KEY `last_7_days` (`last_7_days`),
  ADD KEY `last_30_days` (`last_30_days`),
  ADD KEY `this_month` (`this_month`),
  ADD KEY `last_month` (`last_month`);

--
-- Indexes for table `hdwallsite_top_favourites`
--
ALTER TABLE `hdwallsite_top_favourites`
  ADD PRIMARY KEY (`wallpaper_id`),
  ADD KEY `all` (`all`),
  ADD KEY `today` (`today`),
  ADD KEY `last_7_days` (`last_7_days`),
  ADD KEY `last_30_days` (`last_30_days`),
  ADD KEY `this_month` (`this_month`),
  ADD KEY `last_month` (`last_month`);

--
-- Indexes for table `hdwallsite_top_popular`
--
ALTER TABLE `hdwallsite_top_popular`
  ADD PRIMARY KEY (`wallpaper_id`),
  ADD KEY `all` (`all`),
  ADD KEY `today` (`today`),
  ADD KEY `last_7_days` (`last_7_days`),
  ADD KEY `last_30_days` (`last_30_days`),
  ADD KEY `this_month` (`this_month`),
  ADD KEY `last_month` (`last_month`);

--
-- Indexes for table `hdwallsite_top_ratings`
--
ALTER TABLE `hdwallsite_top_ratings`
  ADD PRIMARY KEY (`wallpaper_id`),
  ADD KEY `all` (`all`),
  ADD KEY `today` (`today`),
  ADD KEY `last_7_days` (`last_7_days`),
  ADD KEY `last_30_days` (`last_30_days`),
  ADD KEY `this_month` (`this_month`),
  ADD KEY `last_month` (`last_month`);

--
-- Indexes for table `hdwallsite_users`
--
ALTER TABLE `hdwallsite_users`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `hdwallsite_users_confirmations`
--
ALTER TABLE `hdwallsite_users_confirmations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userid` (`userid`);

--
-- Indexes for table `hdwallsite_users_notifs`
--
ALTER TABLE `hdwallsite_users_notifs`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `hdwallsite_users_privacy`
--
ALTER TABLE `hdwallsite_users_privacy`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `hdwallsite_users_profile`
--
ALTER TABLE `hdwallsite_users_profile`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `hdwallsite_users_roles`
--
ALTER TABLE `hdwallsite_users_roles`
  ADD PRIMARY KEY (`roleid`);

--
-- Indexes for table `hdwallsite_users_sessions`
--
ALTER TABLE `hdwallsite_users_sessions`
  ADD PRIMARY KEY (`id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `hdwallsite_users_stats`
--
ALTER TABLE `hdwallsite_users_stats`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `hdwallsite_wallpapers`
--
ALTER TABLE `hdwallsite_wallpapers`
  ADD PRIMARY KEY (`wallpaper_id`),
  ADD KEY `date_to_publish` (`date_to_publish`),
  ADD KEY `cat_id` (`cat_id`),
  ADD KEY `license_id` (`license_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `featured` (`featured`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `hdwallsite_wallpapers_categories`
--
ALTER TABLE `hdwallsite_wallpapers_categories`
  ADD PRIMARY KEY (`wallpaper_id`,`category_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `wallpaper_category` (`wallpaper_id`);

--
-- Indexes for table `hdwallsite_wallpapers_comments`
--
ALTER TABLE `hdwallsite_wallpapers_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`);

--
-- Indexes for table `hdwallsite_wallpapers_comments_reported`
--
ALTER TABLE `hdwallsite_wallpapers_comments_reported`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `hdwallsite_wallpapers_images`
--
ALTER TABLE `hdwallsite_wallpapers_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `resolution_id` (`resolution_id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`);

--
-- Indexes for table `hdwallsite_wallpapers_resolutions`
--
ALTER TABLE `hdwallsite_wallpapers_resolutions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallpaper_id` (`wallpaper_id`),
  ADD KEY `resolution_id` (`resolution_id`),
  ADD KEY `typeid` (`typeid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hdwallsite_categories`
--
ALTER TABLE `hdwallsite_categories`
  MODIFY `catid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hdwallsite_configs`
--
ALTER TABLE `hdwallsite_configs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_emails`
--
ALTER TABLE `hdwallsite_configs_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_emails_t`
--
ALTER TABLE `hdwallsite_configs_emails_t`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_lang`
--
ALTER TABLE `hdwallsite_configs_lang`
  MODIFY `langid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_lang_p`
--
ALTER TABLE `hdwallsite_configs_lang_p`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1006;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_lang_s`
--
ALTER TABLE `hdwallsite_configs_lang_s`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_lang_t`
--
ALTER TABLE `hdwallsite_configs_lang_t`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=898;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_routes`
--
ALTER TABLE `hdwallsite_configs_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `hdwallsite_configs_routes_t`
--
ALTER TABLE `hdwallsite_configs_routes_t`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `hdwallsite_licenses`
--
ALTER TABLE `hdwallsite_licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `hdwallsite_mod_admanager`
--
ALTER TABLE `hdwallsite_mod_admanager`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hdwallsite_mod_linkmanager_links`
--
ALTER TABLE `hdwallsite_mod_linkmanager_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_mod_linkmanager_sections`
--
ALTER TABLE `hdwallsite_mod_linkmanager_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hdwallsite_resolutions`
--
ALTER TABLE `hdwallsite_resolutions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `hdwallsite_resolutions_types`
--
ALTER TABLE `hdwallsite_resolutions_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hdwallsite_top_data_downloads`
--
ALTER TABLE `hdwallsite_top_data_downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_top_data_favourites`
--
ALTER TABLE `hdwallsite_top_data_favourites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_top_data_ratings`
--
ALTER TABLE `hdwallsite_top_data_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_top_data_views`
--
ALTER TABLE `hdwallsite_top_data_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_users`
--
ALTER TABLE `hdwallsite_users`
  MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hdwallsite_users_confirmations`
--
ALTER TABLE `hdwallsite_users_confirmations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_users_roles`
--
ALTER TABLE `hdwallsite_users_roles`
  MODIFY `roleid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hdwallsite_users_sessions`
--
ALTER TABLE `hdwallsite_users_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `hdwallsite_wallpapers`
--
ALTER TABLE `hdwallsite_wallpapers`
  MODIFY `wallpaper_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_wallpapers_comments`
--
ALTER TABLE `hdwallsite_wallpapers_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_wallpapers_comments_reported`
--
ALTER TABLE `hdwallsite_wallpapers_comments_reported`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_wallpapers_images`
--
ALTER TABLE `hdwallsite_wallpapers_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hdwallsite_wallpapers_resolutions`
--
ALTER TABLE `hdwallsite_wallpapers_resolutions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hdwallsite_configs_emails_t`
--
ALTER TABLE `hdwallsite_configs_emails_t`
  ADD CONSTRAINT `configs_emails_t_ibfk_1` FOREIGN KEY (`language_id`) REFERENCES `hdwallsite_configs_lang` (`langid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `configs_emails_t_ibfk_2` FOREIGN KEY (`email_id`) REFERENCES `hdwallsite_configs_emails` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_configs_lang_p`
--
ALTER TABLE `hdwallsite_configs_lang_p`
  ADD CONSTRAINT `configs_lang_p_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `hdwallsite_configs_lang_s` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_configs_lang_t`
--
ALTER TABLE `hdwallsite_configs_lang_t`
  ADD CONSTRAINT `configs_lang_t_ibfk_1` FOREIGN KEY (`language_id`) REFERENCES `hdwallsite_configs_lang` (`langid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `configs_lang_t_ibfk_2` FOREIGN KEY (`param_id`) REFERENCES `hdwallsite_configs_lang_p` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_configs_routes_t`
--
ALTER TABLE `hdwallsite_configs_routes_t`
  ADD CONSTRAINT `configs_routes_t_ibfk_1` FOREIGN KEY (`language_id`) REFERENCES `hdwallsite_configs_lang` (`langid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `configs_routes_t_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `hdwallsite_configs_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_mod_linkmanager_links`
--
ALTER TABLE `hdwallsite_mod_linkmanager_links`
  ADD CONSTRAINT `mod_linkmanager_links_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `hdwallsite_mod_linkmanager_sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_resolutions`
--
ALTER TABLE `hdwallsite_resolutions`
  ADD CONSTRAINT `resolutions_ibfk_1` FOREIGN KEY (`typeid`) REFERENCES `hdwallsite_resolutions_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_data_downloads`
--
ALTER TABLE `hdwallsite_top_data_downloads`
  ADD CONSTRAINT `top_data_downloads_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `top_data_downloads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `top_data_downloads_ibfk_3` FOREIGN KEY (`id_resolution`) REFERENCES `hdwallsite_resolutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_data_favourites`
--
ALTER TABLE `hdwallsite_top_data_favourites`
  ADD CONSTRAINT `top_data_favourites_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `top_data_favourites_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_data_ratings`
--
ALTER TABLE `hdwallsite_top_data_ratings`
  ADD CONSTRAINT `top_data_ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `top_data_ratings_ibfk_2` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_data_views`
--
ALTER TABLE `hdwallsite_top_data_views`
  ADD CONSTRAINT `top_data_views_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `top_data_views_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `top_data_views_ibfk_3` FOREIGN KEY (`resolution_id`) REFERENCES `hdwallsite_resolutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_downloads`
--
ALTER TABLE `hdwallsite_top_downloads`
  ADD CONSTRAINT `top_downloads_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_favourites`
--
ALTER TABLE `hdwallsite_top_favourites`
  ADD CONSTRAINT `top_favourites_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_popular`
--
ALTER TABLE `hdwallsite_top_popular`
  ADD CONSTRAINT `top_popular_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_top_ratings`
--
ALTER TABLE `hdwallsite_top_ratings`
  ADD CONSTRAINT `top_ratings_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_users`
--
ALTER TABLE `hdwallsite_users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `hdwallsite_users_roles` (`roleid`);

--
-- Constraints for table `hdwallsite_users_confirmations`
--
ALTER TABLE `hdwallsite_users_confirmations`
  ADD CONSTRAINT `users_confirmations_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_users_notifs`
--
ALTER TABLE `hdwallsite_users_notifs`
  ADD CONSTRAINT `users_notifs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_users_privacy`
--
ALTER TABLE `hdwallsite_users_privacy`
  ADD CONSTRAINT `users_privacy_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_users_profile`
--
ALTER TABLE `hdwallsite_users_profile`
  ADD CONSTRAINT `users_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_users_sessions`
--
ALTER TABLE `hdwallsite_users_sessions`
  ADD CONSTRAINT `users_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_users_stats`
--
ALTER TABLE `hdwallsite_users_stats`
  ADD CONSTRAINT `users_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_wallpapers`
--
ALTER TABLE `hdwallsite_wallpapers`
  ADD CONSTRAINT `wallpapers_ibfk_1` FOREIGN KEY (`cat_id`) REFERENCES `hdwallsite_categories` (`catid`),
  ADD CONSTRAINT `wallpapers_ibfk_2` FOREIGN KEY (`license_id`) REFERENCES `hdwallsite_licenses` (`id`),
  ADD CONSTRAINT `wallpapers_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_wallpapers_categories`
--
ALTER TABLE `hdwallsite_wallpapers_categories`
  ADD CONSTRAINT `wallpapers_categories_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `hdwallsite_categories` (`catid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_wallpapers_comments`
--
ALTER TABLE `hdwallsite_wallpapers_comments`
  ADD CONSTRAINT `wallpapers_comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_comments_ibfk_2` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_wallpapers_comments_reported`
--
ALTER TABLE `hdwallsite_wallpapers_comments_reported`
  ADD CONSTRAINT `wallpapers_comments_reported_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_comments_reported_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `hdwallsite_wallpapers_comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_comments_reported_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_wallpapers_images`
--
ALTER TABLE `hdwallsite_wallpapers_images`
  ADD CONSTRAINT `wallpapers_images_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `hdwallsite_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_images_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `hdwallsite_resolutions_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_images_ibfk_3` FOREIGN KEY (`resolution_id`) REFERENCES `hdwallsite_resolutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_images_ibfk_4` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hdwallsite_wallpapers_resolutions`
--
ALTER TABLE `hdwallsite_wallpapers_resolutions`
  ADD CONSTRAINT `wallpapers_resolutions_ibfk_1` FOREIGN KEY (`wallpaper_id`) REFERENCES `hdwallsite_wallpapers` (`wallpaper_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_resolutions_ibfk_2` FOREIGN KEY (`resolution_id`) REFERENCES `hdwallsite_resolutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallpapers_resolutions_ibfk_3` FOREIGN KEY (`typeid`) REFERENCES `hdwallsite_resolutions_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
