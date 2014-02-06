$(function () {
	$('.exception.message').css('cursor', 'help');
	$('.exception.trace, .hide-script').hide();

	$('.exception.message').click(function () {
		if ($('.exception.trace').is(':visible')) {
			$('.exception.message').css('cursor', 'help');
			$('.exception.trace').slideUp(150);
		} else {
			$('.exception.message').css('cursor', 'pointer');
			$('.exception.trace').slideDown(150);
		}
	});

	$('.dataTables_wrapper *').css('background-color', 'red');

	$('table.contains-data').dataTable( {
		"oLanguage": { "sUrl": "/assets/js/vendor/jquery.dataTables.fr.json" },
		"iDisplayLength": 20,
		"fnInitComplete": function(oSettings, json) {
			$('.dataTables_filter input').attr('placeholder', 'Rechercher�');

			if($(this).is('.first-desc')) {
				$(this).dataTable().fnSort([ [0, 'desc'] ]);
			}
		},
		"fnDrawCallback": function(oSettings) {
			$(this).removeHighlight();
			if($('.dataTables_filter input').val() != '') {
				$('table.contains-data').highlight($('.dataTables_filter input').val());
			}
		}
	});

	var recompenseModifiee = null;
	$('.modifier-recompense').click(function(e) {
		e.preventDefault();

		recompenseModifiee = $(this).attr('data-number');

		// D�sactivation de tous les autres champs
		$('tr').find('td:has(span) span, td:has(a) .modifier-recompense').show();
		$('tr').find('td:has(span) input, td:has(a) .ok-modif-recompense').hide();

		var trConcerne = $('tr[data-number=' + recompenseModifiee + ']');

		trConcerne.find('td:has(span) span, td:has(a) .modifier-recompense').hide();
		trConcerne.find('td:has(span) input, td:has(a) .ok-modif-recompense').show();

		trConcerne.find('td:has(span) input').focus();
	});

	$('.ajax-editable').submit(function(e) {
		e.preventDefault();

		$.ajax({
			'type': 'POST',
			'url': '/api/modifier-recompense',
			'data': {
				'NbParticipation': recompenseModifiee,
				'LibRecompense': $('tr[data-number=' + recompenseModifiee + '] input').val()
			},
			'success': function() {
				$('tr[data-number=' + recompenseModifiee + '] span').html($('tr[data-number=' + recompenseModifiee + '] input').val());
			},
			'error': function() {
				$('.ajax-editable>div div.alert-box.alert').remove();
				$('.ajax-editable>div').prepend($('<div />').addClass('alert-box alert').html('Impossible de mettre � jour l\'�l�ment...'));
			}
		});

		$('tr').find('td:has(span) span, td:has(a) .modifier-recompense').show();
		$('tr').find('td:has(span) input, td:has(a) .ok-modif-recompense').hide();
	})

	var showCyclistDetails = function(cyclistId) {
		$.ajax({
			'type': 'GET',
			'url': '/api/details-cycliste',
			'data': {
				'cyclistId': cyclistId
			},
			'success': function(data) {
				$('.sheet').show();
				$('.sheet .title').html(data.title);
				$('.sheet .lastName').html(data.lastName);
				$('.sheet .firstName').html(data.firstName);
				$('.sheet .address').html(data.address);
				$('.sheet .zipcode').html(data.zipcode);
				$('.sheet .city').html(data.city);

				$('.sheet .edit-details a').attr('href', function() {
					return $(this).attr('data-baseurl') + '?id=' + data.cyclistId + '&returnto=' + encodeURIComponent(location.pathname + '?id=' + data.cyclistId);
				})
			}
		});
	};

	$('.autocomplete-cyclists').each(function() {

		var url = '/api/cyclistes';

		if($(this).is('.departure')) {
			url = '/api/cyclistes?filter=departure';
		} else if($(this).is('.arrival')) {
			url = '/api/cyclistes?filter=arrival';
		}

		if($(this).val() != '') {
			showCyclistDetails($(this).val());
		}

		$(this).autocomplete({
			appendTo: '.autocomplete-results',
			source: url,
			delay: 10,
			select: function(event, ui) {
				var regex = /^.+ \((\d+)\)$/g;
				var match = regex.exec(ui.item.value);
				var id = match[1];

				showCyclistDetails(id);
			},
			create: function() {
				$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
					var newText = String(item.value).replace(
						new RegExp(this.term.replace(" ", "|"), "gi"),
						"<span class='ui-state-highlight'>$&</span>");

					return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a>" + newText + "</a>")
						.appendTo(ul);
				};
			}
		});
	});

	var showCyclistDetailsForRace = function(cyclistId, raceNumber) {
		$.ajax({
			'type': 'GET',
			'url': '/api/details-cycliste-course',
			'data': {
				'cyclistId': cyclistId,
				'raceNumber': raceNumber
			},
			'success': function(data) {
				$('.sheet').show();
				$('.sheet .title').html(data.title);
				$('.sheet .lastName').html(data.lastName);
				$('.sheet .firstName').html(data.firstName);
				$('.sheet .address').html(data.address);
				$('.sheet .zipcode').html(data.zipcode);
				$('.sheet .city').html(data.city);

				$('.sheet .edit-details a').attr('href', function() {
					return $(this).attr('data-baseurl') + '?id=' + data.cyclistId + '&returnto=' + encodeURIComponent(location.pathname + '?id=' + data.cyclistId);
				});

				$('.race .circuit').html(data.circuitNumber);
				$('.race .distance').html(data.distance);
				$('.race').show();

				if(data.rewardName && data.rewardName.trim() != '') {
					$('.reward .nbRaces').html(data.nbRaces);
					$('.reward .rewardName').html(data.rewardName);
					$('.reward').show();
				}
			}
		});
	};

	$('.autocomplete-cyclists-filter').each(function() {

		var url = '/api/cyclistes';

		if($(this).is('.departure')) {
			url = '/api/cyclistes?filter=departure';
		} else if($(this).is('.arrival')) {
			url = '/api/cyclistes?filter=arrival';
		}

		if($(this).val() != '') {
			showCyclistDetails($(this).val());
		}

		$(this).autocomplete({
			appendTo: '.autocomplete-results',
			source: url,
			delay: 10,
			select: function(event, ui) {
				var regex = /^.+ \((\d+)\)$/g;
				var match = regex.exec(ui.item.value);
				var id = match[1];

				raceNumber = $(this).attr('data-race-number');
				showCyclistDetailsForRace(id, raceNumber);
			},
			create: function() {
				$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
					var newText = String(item.value).replace(
						new RegExp(this.term.replace(" ", "|"), "gi"),
						"<span class='ui-state-highlight'>$&</span>");

					return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a>" + newText + "</a>")
						.appendTo(ul);
				};
			}
		});
	});
});