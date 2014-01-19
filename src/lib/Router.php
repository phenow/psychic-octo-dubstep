<?php

/**
 * Le routeur permet d'associer un tuple (contr�leur, action) � une URL donn�e.
 */
abstract class Router {

	/**
	 * R�cup�re le contr�leur, l'action et les param�tres associ�s � une URL donn�e.
	 * @param string $url L'URL demand�e par l'utilisateur.
	 * @return array Un tableau d�crivant le contr�leur, l'action et les param�tres.
	 */
	public static function parseUrl($url) {

		// Premi�rement, on enl�ve de l'URL � analyser le r�pertoire de base
		// Par exemple, si le r�pertoire de base du site est /lionne/
		// et que l'on demande l'URL /lionne/accueil, on r�cup�re uniquement "accueil".
		$url = preg_replace("#^" . preg_quote(Config::get('basePath')) . '#', '', $url);

		$returnValue = array();
		$parameters = array();

		// On analyse l'URL pour voir si elle correspond � une route
		if(preg_match("#^/$#", $url)) {
			// Page d'accueil
			$route = "home.index";
		} elseif(preg_match("#^/connexion$#", $url)) {
			// Formulaire de connexion
			$route = "login.showForm";
		} elseif(preg_match("#^/deconnexion$#", $url)) {
			// D�connexion
			$route = "login.logout";
		} else {
			// L'URL ne correspond � aucune route : on l�ve une exception
			throw new Http404Exception($url);
		}

		// On convertit le nom du contr�leur, et de l'action
		$controllerAndAction = explode('.', $route);
		$returnValue["controller"] = lcfirst($controllerAndAction[0] . "Controller");
		$returnValue["action"] = $controllerAndAction[1];

		// On ajoute les paramètres GET (présents après le point d'interrogation dans l'URL)
		$returnValue["parameters"] = array_merge($parameters, $_GET);

		return $returnValue;
	}

	public static function generateUrl($route, array $parameters = array()) {

		$url = Config::get('basePath');

		switch($route) {
			case 'home.index':
				$url = '/';
				break;
			case 'login.showForm':
				$url = '/connexion';
				break;
			case 'login.logout':
				$url = '/deconnexion';
				break;
			default:
				throw new RouterException($route);
		}

		return $url;

	}

}