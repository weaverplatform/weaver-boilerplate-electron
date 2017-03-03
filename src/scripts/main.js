(function() {
	'use strict';

	var Popup = require('./popup');
	var PopupTypes = require('./popup').Types;
	var stepRouter = require('./steprouter');

	var projects = {};
	var nodes = {};
	var connected = false;
	var weaver = null;
	var currentProject = null;

	var contentContainer = $('#content');

	function connect() {
		var dburl = $('#db-url').val();
		Weaver.connect(dburl).then(function() {
			$('#step-2').removeClass('disabled');
			$('#step-3').removeClass('disabled');
			stepRouter.next();
			connected = Weaver._connected;
		}).catch(console.error);
	}

	function createProject() {
		var name = $('#project-name').val();
		var project = new Weaver.Project();
		project.set('name', name);
		project.create().then(function() {
			project.save();
			projects[project.nodeId] = project;
			new Popup(PopupTypes.success, 'Project has been created!').show();
		}).catch(console.error);
	}

	function refreshProjects() {
		Weaver.Project.list()
		.then(function(res) {
			populateProjectTable(res);
		});
	}

	function useProject(project) {
		Weaver.useProject(project);
		currentProject = project;
		$('.current-project').addClass('active');
		$('#current-project').html((project.attributes.name || 'Unnamed project') + ' (' + project.nodeId + ')')
		stepRouter.next();
	}

	function getNodeList() {
		var projNode = Weaver.currentProject();
		var proj = new Weaver.Project(projNode.nodeId);
		proj.getAllNodes().then(function(res) {
			populateNodeList(res);
		}).catch(console.error);
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
			new Popup(PopupTypes.success, 'Node has been created!').show();
		}).catch(console.error);;
	}

	function addAttribute() {
		var id = $('#node-attr-id').val();
		var key = $('#node-attr-key').val();
		var value = $('#node-attr-val').val();

		if (id === '') {
			id = undefined;
		}

		Weaver.Node.load(id).then(function(node) {
			node.set(key, value);
			node.save();
			new Popup(PopupTypes.success, 'Attribute added to node!').show();
		}).catch(console.error);;
	}

	function addRelation() {
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
	        Weaver.Node.load(id2).then(function(node2) {
	            node1.relation(key).add(node2)
	            node1.save()
				new Popup(PopupTypes.success, 'Relationship created!').show()
	        })
	    })
	}

	function wipe() {
	    var currentProjId = Weaver.currentProject().nodeId;
	    currentProject = new Weaver.Project(currentProjId);
	    currentProject.wipe();
		new Popup(PopupTypes.success, 'Database has been wiped!').show();
	}

	function selectProject() {
		var id = $(this).data('project');
		var project = projects[id];
		useProject(project);
		$('#step-4').removeClass('disabled');
		$('#step-5').removeClass('disabled');
		$('#step-6').removeClass('disabled');
		$('#step-7').removeClass('disabled');
		$('#step-8').removeClass('disabled');
	}

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

	$('#menu li a').click(function() {
		var nextStep = $(this).data('step');
		stepRouter.goto(nextStep);
	})

	stepRouter.on('step change', function(step) {
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
	});

	contentContainer.on('click', '#btn-next-step', stepRouter.next.bind(stepRouter));
	contentContainer.on('click', '#refresh-projects', refreshProjects);
	contentContainer.on('click', '#refresh-nodes', getNodeList);
	contentContainer.on('click', '#btn-create-project', createProject);
	contentContainer.on('click', '#btn-connect', connect);
	contentContainer.on('click', '#btn-create-node', createNewNode);
	contentContainer.on('click', '#btn-wipe', wipe);
	contentContainer.on('click', '#btn-add-attr', addAttribute);
	contentContainer.on('click', '#btn-add-rel', addRelation);
	contentContainer.on('click', '#btn-run-query', runQuery);
	contentContainer.on('click', '.select-project', selectProject);

})();
