// CONFIG
var config = {
    spreadsheetId: ''
};

// AUTH
var auth = {
    
};

// APPLICATION
(function() {
  // utility functions
  function render(template, data){
    return swig.render($(template).html(), {locals: data});
  }
  
  function secondsToTime(secs){
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    var obj = {"h": hours, "m": minutes, "s": seconds};
    return obj;
  }
  
  function formatTime(seconds){
    var time = secondsToTime(seconds);
    return pad(time.h, 2) + ":" + pad(time.m, 2) + ":" + pad(time.s, 2);
  }
  
  swig.setFilter('formatTime', formatTime);
  
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  
  // collections
  var ProjectCollection = Backbone.Collection.extend({});
  var TimesheetCollection = Backbone.Collection.extend({
    comparator: function(day){
      return -day.get('date');
    }
  });
  var WorkCollection = Backbone.Collection.extend({
    comparator: function(work){
      return -work.get('start');
    }
  });
  // instances of the collections
  var projects = new ProjectCollection();
  var timesheet = new TimesheetCollection();
  var work = new WorkCollection();
  
  // setup the backbone app and router
  var Application = Backbone.Marionette.Application.extend({
    region: "#contentContainer", // set the regions on the page
    initialize: function(options) {
      this.router = new Router();
      
      Api.loadData().then(function(data){
        // init the projects
        projects.reset();
        projects.add(data.projects);
        // init the work items
        work.reset();
        work.add(data.work);
        // only start the routing when the data is loaded
        if(!Backbone.History.started){
          Backbone.history.start({pushState: false});
        }
      });
    }
  });
  
  var Router = Backbone.Router.extend({
    cv: null, // content view
    routes: {
      "": "home",
      "home": "home",
      "dashboard": "dashboard",
      "projects/create": "create",
      "projects/view/:id": "view",
      "work/add/:project_id": "add"
    },
    home: function(){
      this.cv = new HomeView({});
      App.showView(this.cv);
    },
    create: function(){
      this.cv = new CreatProjectView({});
      App.showView(this.cv);
    },
    dashboard: function(){
      this.cv = new DashboardView({});
      App.showView(this.cv);
    },
    view: function(id){
      this.cv = new ProjectView({id: id});
      App.showView(this.cv);
    },
    add: function(project_id){
      this.cv = new AddWorkView({project_id: project_id});
      App.showView(this.cv);
    }
  });
  
  var App = new Application();
  
  var AddWorkView = Backbone.View.extend({
    name: "add_work",
    template: "#add_work_view",
    events: {
      "click .add": "add"
    },
    initialize: function(options) {
      this.options = options || {};
    },
    render: function() {
      this.$el.html(render(this.template, {}));
    },
    add: function() {
      var view = this;
      var work_item = {
        project: this.options.project_id,
        start: this.$el.find("#start_time").val(),
        end: this.$el.find("#end_time").val(),
        worked_on: this.$el.find("#worked_on").val()
      };
      // save to data
      Api.addWork(work_item).then(function(data){
        work.add(data);
        // did we just create it?
        if(App.router.cv.name == "add_work"){
          App.router.navigate("projects/view/" + view.options.project_id, true);
        }
      });
    }
  });
  
  var CreatProjectView = Backbone.View.extend({
    name: "create_project",
    template: "#create_project_view",
    events: {
      "click .create": "create"
    },
    render: function() {
      this.$el.html(render(this.template, {projects: projects.where()}));
    },
    create: function() {
      var data = {
        title: this.$el.find("#title").val(),
        contact_name: this.$el.find("#contact_name").val(),
        rate: this.$el.find("#rate").val(),
        description: this.$el.find("#description").val(),
        archived: false
      };
      // update the data
      Api.createProject(data).then(function(data){
        projects.add(data);
        // did we just add it?
        if(App.router.cv.name == "create_project"){
          App.router.navigate("home", true);
        }
      });
    }
  });
  
  var DashboardView = Backbone.View.extend({
    template: "#dashboard_view",
    events: {
      "click .edit": "edit"
    },
    render: function() {
      var year = moment().year();
      this.$el.html(render(this.template, {timesheet: timesheet.filter(day => moment(day.date).year() == year), year: year}));
    },
    edit: function(ev){
      var _id = $(ev.target).attr("data-id");
      // TODO: create edit functionality
    },
  });
  
  var HomeView = Backbone.View.extend({
    template: "#home_view",
    events: {
      "click .view": "view",
      "click .edit": "edit",
      "click .archive": "archive",
      "click .delete": "delete"
    },
    initialize: function() {
    },
    render: function() {
      this.$el.html(render(this.template, {projects: projects.where({archived: false})}));
    },
    edit: function(ev){
      var _id = $(ev.target).attr("data-id");
      // TODO: create edit functionality
    },
    archive: function(ev){
      var _id = $(ev.target).attr("data-id");
      // update locally
      projects.findWhere({_id: _id}).set("archived", true);
      // update the data
      Api.archiveProject({_id: _id});
      // redraw
      this.render();
    },
    delete: function(ev){
      var _id = $(ev.target).attr("data-id");
      // update locally
      projects.findWhere({_id: _id}).destroy();
      // update the data
      Api.deleteProject({_id: _id});
      // redraw
      this.render();
    }
  });
  
  var ProjectView = Backbone.View.extend({
    name: "view_project",
    template: "#project_view",
    initialize: function(options) {
      this.options = options || {};
      this.options.project = projects.findWhere({_id: this.options.id});
    },
    render: function() {
      this.$el.html(render(this.template, {project: this.options.project, work: work.where({project: this.options.id})}));
    },
    stop: function(){
      // keep reference for use inside callbacks
      var proj_view = this;
      // unpause if paused
      if(this.options.is_paused){
        this.pause();
      }
      // update the buttons
      $(".start").removeClass("hide");
      $(".pause").addClass("hide");
      $(".stop").addClass("hide");
      // clear interval
      clearInterval(this.options.interval);
      $("#timer").html(this.timer_placeholder);
      var now = +new Date();
      // fetch what they worked on
      bootbox.prompt("What did you work on?", function(response){
        // send the data back to the server
        var work_item = {
          project: proj_view.options.id,
          start: proj_view.options.start_time,
          end: now,
          duration: proj_view.calculateTotalTime(),
          breaks: proj_view.options.breaks,
          worked_on: response || ""
        };
        // save to data
        Api.addWork(work_item).then(function(data){
          work.add(data);
          // did we just create it?
          if(App.router.cv.name == "view_project"){
            App.router.cv.render();
          }
        });
        // clear the data
        proj_view.options.breaks = [];
      });
    },
    // factor in breaks, and work out the total time worked
    calculateTotalTime: function(){
      // work out the total without the breaks
      var total;
      if(this.options.is_paused){
        // if we are still on a break, use the break start time as the end time
        total = this.options.last_paused - this.options.start_time;
      } else {
        total = (+new Date()) - this.options.start_time;
      }
      // factor in the breaks
      for(var i = 0; i < this.options.breaks.length; i++){
        total -= this.options.breaks[i].duration;
      }
      // return the total
      return total;
    }
  });
  
  App.start();
})();
