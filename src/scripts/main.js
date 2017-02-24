'use strict';

$(function() {
	var projects = {};
	var nodes = {};
	var currentStep = 1;
	var connected = false;
	var weaver = null;
	var currentProject = null;

	$('#content').load('src/html/step1.html');

	$('#menu li a').click(function(e) {
		var nextStep = $(this).data('step');
		loadStep(nextStep);
	})

	$('#content').on('click', '#btn-next-step', function(e) {
		loadStep(currentStep + 1);
	});

	$('#content').on('click', '#refresh-projects', function(e) {
		refreshProjects();
	});

	$('#content').on('click', '#refresh-projects', function(e) {
		getNodeList();
	});

	function addNotification(type, message) {
		$('.notification-container').append(
			'<div class="notification is-' + type + '">' +
			message +
			'</div>'
		);
		setTimeout(function() {
			$('.notification-container').children(':first').remove();
		}, 5000);
	}

	$('#content').on('click', '#btn-create-project', function(e) {
		var name = $('#project-name').val();
		var project = new Weaver.Project();
		project.set('name', name);
		project.create().then(function() {
			project.save();
			projects[project.nodeId] = project;
			addNotification('success', 'Project has been created!');
		});
	});

	$('#content').on('click', '#btn-connect', function(e) {
		var dburl = $('#db-url').val();
		Weaver.connect(dburl).then(function() {
			$('#step-2').removeClass('disabled');
			$('#step-3').removeClass('disabled');
			loadStep(currentStep + 1);
			connected = Weaver._connected;
		}).catch(function(e) {
			console.log(e);
		});
	});

	function loadStep(step) {
		if(step === currentStep) return;
		$('#menu').children('li').each(function() {
			$(this).removeClass('active');
		})
		$('#step-' + step).parent().addClass('active');
		$('#content').load('src/html/step' + step + '.html').hide().fadeIn('slow');
		stepActions(step);
		currentStep = step;
	}

	function stepActions(step) {
		switch(step) {
			case 3:
				refreshProjects();
				break;
			case 5:
				getNodeList();
				break;
			default:
				break;
		}
	}

	function refreshProjects() {
		Weaver.Project.list()
		.then(function (res) {
			populateProjectTable(res);
		});
	}

	function useProject(project) {
		Weaver.useProject(project);
		currentProject = project;
		$('.current-project').addClass('active');
		$('#current-project').html((project.attributes.name || 'Unnamed project') + ' (' + project.nodeId + ')')
		loadStep(currentStep + 1);
	}

	function getNodeList() {
		var projNode = Weaver.currentProject();
		var proj = new Weaver.Project(projNode.id());
		proj.getAllNodes().then(function(res) {
			populateNodeList(res);
		});
	}

	function createNewNode() {
		var name = $('#node-name').val();
		var id = $('#node-id').val();

		if(id === '') {
			id = undefined;
		}

		var node = new Weaver.Node(id);

		if(name) {
			node.set('name', name);
		}

		node.save().then(function() {
			nodes[node.nodeId] = node;
			addNotification('success', 'Node has been created!');
		});
	}

	$('#content').on('click', '#btn-create-node', function() {
		createNewNode();
	});

	$('#content').on('click', '#btn-wipe', function() {
		wipe();
	});

	$('#content').on('click', '#btn-add-attr', function() {
		addAttribute();
	})

	$('#content').on('click', '#btn-add-rel', function() {
		addRelation();
	})

	$('#content').on('click', '#btn-run-query', function() {
		runQuery();
	})

	function addAttribute() {
		var id = $('#node-attr-id').val();
		var key = $('#node-attr-key').val();
		var value = $('#node-attr-val').val();

		if (id === '') {
			id = undefined;
		}

		Weaver.Node.load(id).then(function(node) {
			console.log(node);
			node.set(key, value);
			node.save();
			addNotification('success', 'Attribute added to node!');
		});
	}

	function addRelation(){
	    var id1 = $('#node-rel-id1').val();
	    var key = $('#node-rel-key').val();
	    var id2 = $('#node-rel-id2').val();

	    if(id1 === '') {
	        id1 = undefined;
	    }
	    if(id2 === '') {
	        id2 = undefined;
	    }

	    Weaver.Node.load(id1).then(function(node1) {
	        Weaver.Node.load(id2).then(function(node2){
	            node1.relation(key).add(node2)
	            node1.save()
				addNotification('success', 'Relationship created!')
	        })
	    })
	}

	function wipe(){
	    var currentProjId = Weaver.currentProject().nodeId;
	    currentProject = new Weaver.Project(currentProjId);
	    currentProject.wipe();
		addNotification('success', 'Database has been wiped!');
	}

	$('#content').on('click', '.select-project', function(e) {
		var id = $(this).data('project');
		var project = projects[id];
		useProject(project);
		$('#step-4').removeClass('disabled');
		$('#step-5').removeClass('disabled');
		$('#step-6').removeClass('disabled');
		$('#step-7').removeClass('disabled');
		$('#step-8').removeClass('disabled');
	})

	function populateNodeList(res) {
		var table = $('#node-table');
		var items = [];
		$.each(res, function(i, item) {
			nodes[item.id] = item;
			items.push('<tr><td>' +
				item.id +
				'</td></tr>')
		});
		table.html(items.join(''));
	}

	function populateProjectTable(proj) {
		var table = $('#project-table');
		var items = [];

		$.each(proj, function(i, item) {
			projects[item.nodeId] = item;
			items.push('<tr><td>' +
				item.nodeId +
				'</td><td>' +
				(item.attributes.name || 'Unnamed poject') +
				'</td><td>' +
				'<button class="button is-primary is-outlined select-project" data-project="' + item.nodeId + '">Select</button>' +
				'</td></tr>')
		});

		table.html(items.join(''));
	}

	function runQuery() {
	    var query = $('#query-field').val()

	    var q = new Weaver.Query();
	    q.nativeQuery(query)
	    .then(function(res) {
	            $('#query-field').val(JSON.stringify(res, null, 4));
	    })
	}
});
