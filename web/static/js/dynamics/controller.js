var iterationController = function(iterationId, element) {
 this.iterationId = iterationId;
 this.element = element;
 var me = this;
 this.iterationGoalControllers = [];
 ModelFactory.getIteration(this.iterationId, function(data) { me.render(data); });
}
iterationController.prototype = {
    changeIterationGoalPriority: function(ev, el) {
      var priority = 0;
      var model = el.item.data("model");
      var previous = el.item.prev();
      var prevModel = previous.data("model");
      if(prevModel) {
        if(prevModel.getPriority() > model.getPriority()) {
          priority = prevModel.getPriority();
        } else {
          priority = prevModel.getPriority() + 1;
        }
      }
      model.setPriority(priority);
      //all goals must be updated
      this.model.reloadGoalData();
    },
    showBacklogItems: function() {
      for(var i = 0 ; i < this.iterationGoalControllers.length; i++) {
        this.iterationGoalControllers[i].showBacklogItems();
      }
    },
    hideBacklogItems: function() {
      for(var i = 0 ; i < this.iterationGoalControllers.length; i++) {
        this.iterationGoalControllers[i].hideBacklogItems();
      }      
    },
    deleteGoal: function(goal) {
      var parent = $("<div />").appendTo(document.body).text("Are you sure you wish to delete this iteration goal?");
      var me = this;
      parent.dialog({
        resizable: false,
        height:140,
        modal: true,
        buttons: {
          'Yes': function() {
            $(this).dialog('close');
            parent.remove();
            me.model.removeGoal(goal);
          },
          Cancel: function() {
            $(this).dialog('close');
            parent.remove();
          }
        }
      });
    },
    addRow: function(goal) {
        var me = this;
        var row = me.view.createRow(goal);
        var prio = row.createCell({
          get: function() { return goal.priority; }
        });
        var name = row.createCell({
          type: "text", 
          get: function() { return goal.getName();}, 
          set: function(val){ goal.setName(val);}});
        name.activateSortHandle();
        var elsum = row.createCell({
          get: function() { return agilefantUtils.aftimeToString(goal.getEffortLeft()); }});
        var oesum = row.createCell({
          get: function() { return agilefantUtils.aftimeToString(goal.getOriginalEstimate()); }});
        var essum = row.createCell({
          get: function() { return agilefantUtils.aftimeToString(goal.getEffortSpent()); }});
        var tasks = row.createCell({
          get: function() { 
        	  return goal.getDoneTasks() + " / " + goal.getTotalTasks();
        	}});
        var buttons = row.createCell();
        
        var desc = row.createCell({
          type: "wysiwyg", 
          get: function() { return goal.description; }, 
          set: function(val) { goal.setDescription(val);},
          buttons: {
            save: {text: "Save", action: function() {
              goal.beginTransaction();
              row.saveEdit();
              goal.commit();
            }},
            cancel: {text: "Cancel", action: function() {
              row.cancelEdit();
            }}
          }}) //.getElement().hide();
        var blis = row.createCell();
        var blictrl = new iterationGoalController(blis, goal);
        this.iterationGoalControllers.push(blictrl);
        buttons.setActionCell({items: [
                                       {
                                         text: "Edit",
                                         callback: function(row) {
                                           row.openEdit();
                                         }
                                       }, {
                                         text: "Delete",
                                         callback: function() {
                                           me.deleteGoal(goal);
                                         }
                                       }, {
                                         text: "Show BLIs",
                                         callback: function() {
                                           blictrl.showBacklogItems();
                                           desc.getElement().hide();
                                         }
                                       }, {
                                         text: "Hide BLIs",
                                         callback: function() {
                                           blictrl.hideBacklogItems();
                                         }
                                       }, {
                                    	   text: "Toggle description",
                                    	   callback: function() {
                                    	   	desc.getElement().toggle();
                                           }
                                       },
                                       {
                                    	 text: "Add Backlog item",
                                    	 callback: function() {
                                    	   	blictrl.createBli();
                                       	 }
                                       }
                                       ]});
        row.getElement().bind("metricsUpdated", function() {
        	goal.reloadMetrics();
        });
    },
    render: function(data) {
      var me = this;
      this.view = jQuery(this.element).iterationGoalTable();
      
      this.view.activateSortable({update: function(ev,el) { me.changeIterationGoalPriority(ev,el);}});
      
      this.view.setActionCellParams({ items:
         [
          {
        	  text: "Add iteration goal",
        	  callback: function() {
        	    me.createGoal();
          	   }
          },
          {
            text: "Show all blis",
            callback: function() {
              me.showBacklogItems();
            }
          }, 
          {
            text: "Hide all blis",
            callback: function() {
              me.hideBacklogItems();
            }
          }
          ]
      });
      
      var goals = data.getIterationGoals();
      this.model = data;
      jQuery.each(goals, function(index, goal){
    	  me.addRow(goal);
      });
      var row = me.view.createRow(null);
      row.createCell();
      var name = row.createCell().setValue("Items without goal.");
      var elsum = row.createCell();
      var oesum = row.createCell();
      var essum = row.createCell();
      var tasks = row.createCell();
      var acts = row.createCell();
      row.setNotSortable();
      var blis = row.createCell();
      var blictrl = new iterationGoalController(blis, data);
      this.view.render();

    },
    storeGoal: function(row,goal) {
    	  row.saveEdit();
    	  row.remove();
    	  goal = goal.copy();
        this.addRow(goal);
        this.model.addGoal(goal);
        goal.commit();
        this.model.reloadGoalData();
        //this.view.sortTable();
    },
    createGoal: function() {
    	var me = this;
    	var fakeGoal = new iterationGoalModel(this.iterationId);
    	fakeGoal.beginTransaction(); //block autosaves
        var row = this.view.createRow(fakeGoal,{toTop: true}, true);
        row.setNotSortable();
        var prio = row.createCell();
        var name = row.createCell({
          type: "text", get: function() { return ""; },
          set: function(val){ fakeGoal.setName(val);}});
        var elsum = row.createCell();
        var oesum = row.createCell();
        var essum = row.createCell();
        var tasks = row.createCell();
        var buttons = row.createCell();
        buttons.setActionCell({items: [{
                                         text: "Cancel",
                                         callback: function() {
                                           row.remove();
                                         }
                                       }
                                       ]});
        var desc = row.createCell({
          type: "wysiwyg",  get: function() { return ""; },
          set: function(val) { fakeGoal.setDescription(val);},
          buttons: {
            save: {text: "Save", action: function() {
              me.storeGoal(row,fakeGoal);           
            }},
            cancel: {text: "Cancel", action: function() {
            	row.remove();
            }}
          }});
        row.render();
        row.openEdit();
    }
};


var iterationGoalController = function(parentView, model) {
  //this.element = element;
  this.parentView = parentView;
  parentView.getElement().css("padding-left","2%"); //TODO: refactor
  this.element = $("<div />").width("95%").appendTo(parentView.getElement());
  this.data = model;
  this.render(this.data);
};
iterationGoalController.prototype = {
  hideBacklogItems: function() {
    this.parentView.getElement().hide();
  },
  showBacklogItems: function() {
    this.parentView.getElement().show();
  },
  deleteBli: function(goal) {
      var parent = $("<div />").appendTo(document.body).text("Are you sure you wish to delete this backlog item?");
      var me = this;
      parent.dialog({
        resizable: false,
        height:140,
        modal: true,
        buttons: {
          'Yes': function() {
            $(this).dialog('close');
            parent.remove();
            goal.remove();
          },
          Cancel: function() {
            $(this).dialog('close');
            parent.remove();
          }
        }
      });
    },
  addRow: function(bli) {
    var me = this;
    var row = this.view.createRow(bli);
    var themes = row.createCell({
    	type: "theme",
    	backlogId: bli.backlog.getId(),
    	set: function(themes) { bli.setThemes(themes); bli.setThemeIds(agilefantUtils.objectToIdArray(themes)); },
    	get: function() { return bli.getThemes(); },
    	decorator: agilefantUtils.themesToHTML
    });
    var name = row.createCell({
      type: "text",
      set: function(val) { bli.setName(val); },
      get: function() { return bli.getName(); }
    });
    var state = row.createCell({
      type: "select",
      items: agilefantUtils.states,
      set: function(val) { bli.setState(val); },
      get: function() { return bli.getState(); },
      decorator: agilefantUtils.stateToString
    });
    row.createCell({
      type: "select",
      items: agilefantUtils.priorities, 
      get: function() { return bli.getPriority(); },
      decorator: agilefantUtils.priorityToString,
      set: function(val) { bli.setPriority(val); }
    });
    row.createCell({
      type: "userchooser",
    	get: function() { return bli.getUsers(); },
    	decorator: agilefantUtils.userlistToHTML,
      userchooserCallback: function(uc) {
    	  bli.setUsers(agilefantUtils.createPseudoUserContainer(uc.getSelected(true))); 
    	  row.render();
    	  bli.setUserIds(uc.getSelected());	  
    	  },
      backlogId: bli.backlog.getId(),
      backlogItemId: bli.getId()
    });
    var el = row.createCell({
      type: "effort",
      set: function(val) { bli.setEffortLeft(val); },
      get: function() { return bli.getEffortLeft(); },
      canEdit: function() { return (bli.getOriginalEstimate() != null);},
      decorator: agilefantUtils.aftimeToString
    });
    var oe = row.createCell({
      type: "effort",
      get: function() { return bli.getOriginalEstimate(); },
      canEdit: function() { return (!bli.getOriginalEstimate());},
      set: function(val) { bli.setOriginalEstimate(val); },
      decorator: agilefantUtils.aftimeToString
    });
    var es = row.createCell({
      get: function() { return bli.getEffortSpent(); },
      decorator: agilefantUtils.aftimeToString
    });
    var buttons = row.createCell();
    buttons.setActionCell({items: [ 
                                   {
                                	 text: "Reset original estimate",
                                	 callback: function() {
                                	   bli.resetOriginalEstimate();
                                   	 }
                                   },
                                   {
                                     text: "Edit",
                                     callback: function(row) {
                                	   bli.beginTransaction();
                                       row.openEdit();
                                     }
                                   }, {
                                     text: "Delete",
                                     callback: function() {
                                       me.deleteBli(bli);
                                     }
                                   }
                                   ]});
    var desc = row.createCell({
      type: "wysiwyg", 
      get: function() { return bli.getDescription(); }, 
      set: function(val) { bli.setDescription(val);},
      buttons: {
        save: {text: "Save", action: function() {
          row.saveEdit();
          bli.commit();
        }},
        cancel: {text: "Cancel", action: function() {
          bli.rollBack();
          row.cancelEdit();
        }}
      }}); //.getElement().hide();
  },
  createBli: function() {
    var me = this;
    var bli = new backlogItemModel();
    bli.backlog = this.data.iteration;
    bli.id = 0;
    bli.beginTransaction();
    var row = this.view.createRow(bli,{toTop: true}, true);
    var themes = row.createCell({
    	type: "theme",
    	backlogId: bli.backlog.getId(),
    	set: function(themes) { bli.setThemeIds(agilefantUtils.objectToIdArray(themes)); bli.setThemes(themes);},
    	get: function() { return bli.getThemes(); },
    	decorator: agilefantUtils.themesToHTML
    });
    var name = row.createCell({
      type: "text",
      set: function(val) { bli.setName(val); },
      get: function() { return bli.getName(); }
    });
    var state = row.createCell({
      type: "select",
      items: agilefantUtils.states,
      set: function(val) { bli.setState(val); },
      get: function() { return bli.getState(); },
      decorator: agilefantUtils.stateToString
    });
    row.createCell({
      type: "select",
      items: agilefantUtils.priorities, 
      get: function() { return bli.getPriority(); },
      decorator: agilefantUtils.priorityToString,
      set: function(val) { bli.setPriority(val); }
    });
    row.createCell({
      type: "userchooser",
    	get: function() { return bli.getUsers(); },
    	decorator: agilefantUtils.userlistToHTML,
      userchooserCallback: function(uc) { 
      	  bli.setUsers(agilefantUtils.createPseudoUserContainer(uc.getSelected(true))); 
    	  row.render();
    	  bli.setUserIds(uc.getSelected());	  
    	},
      backlogId: bli.backlog.getId(),
      backlogItemId: bli.getId()
    });
    var el = row.createCell();
    var oe = row.createCell({
      type: "effort",
      set: function(val) { bli.setOriginalEstimate(val); },
      get: function() { return bli.getOriginalEstimate(); },
      decorator: agilefantUtils.aftimeToString  
    });
    var es = row.createCell();
    var buttons = row.createCell();
    buttons.setActionCell({items: [
                                   {
                                     text: "Cancel",
                                     callback: function(row) {
                                	   row.remove();
                                     }
                                   }
                                   ]});
    var desc = row.createCell({
      type: "wysiwyg", 
      get: function() { return bli.getDescription(); }, 
      set: function(val) { bli.setDescription(val);},
      buttons: {
        save: {text: "Save", action: function() {
          row.saveEdit();
          row.remove();
          me.data.addBacklogItem(bli);
          me.addRow(bli);
          bli.commit();
          //me.view.sortTable();
        }},
        cancel: {text: "Cancel", action: function() {
          row.remove();
        }}
      }});
    row.updateColCss();
    row.openEdit();
  },
  render: function(data) {
    var me = this;
    var blis = data.getBacklogItems();
    this.view = jQuery(this.element).backlogItemsTable();
    this.view.getElement().addClass('dynamictable-backlogitem-droppable');
    this.view.getElement().sortable({
        connectWith: '.dynamictable-backlogitem-droppable',
        not: '.dynamictable-notsortable',
        placeholder : 'dynamictable-placeholder'
      });
    if(blis && blis.length > 0) {
      for(var i = 0; i < blis.length; i++) {
        me.addRow(blis[i]);
      }
    } else {
      this.element.hide();
    }
    this.view.render();
    this.hideBacklogItems();
  }
};


var backlogItemController = function(parentController, model) {

};
backlogItemController.prototype = {

};