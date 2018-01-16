Api = {
  loadData: function(){
    // fetch all data
    return new Promise(function(resolve, reject) {
      /*app.db.projects.find({}, function(err, projects){
        app.db.work.find({}, function(err, work){
          resolve({projects: projects, work: work});
        });
      });*/
      resolve({projects: [{
        _id: "1",
        title: "MDAGE",
        description: "Modelo de Direcciones de la Administración General del Estado",
        archived: false
      }, {
        _id: "2",
        title: "CEC",
        description: "Censo Electoral Centralizado",
        archived: true
      }], work: [{
          _id: "1",
          breaks: [{
            duration: 10855,  // ms
            end: 1516112692153,
            start: 1516112681298
          }],
          duration: 53364,
          end: 1516112702713,
          project: "1",
          start: 1516112662904,
          worked_on: "Actualización datos"
        }]});
    });
  },
  createProject: function(data){
    // creating a new project
    return new Promise(function(resolve, reject) {
      /*app.db.projects.insert(data, function(err, doc){
        resolve(doc);
      });*/
      resolve({
        _id: "1",
        title: "MDAGE",
        description: "Modelo de Direcciones de la Administración General del Estado",
        archived: false
      });
    });
  },
  archiveProject: function(data){
    // archive project
    return new Promise(function(resolve, reject) {
      /*
      app.db.projects.update({_id: data._id}, {$set: {archived: true}});
      */
      resolve(true);
    });
  },
  deleteProject: function(data){
    // delete project
    return new Promise(function(resolve, reject) {
      /*
      app.db.projects.remove({_id: data._id});
      */
      resolve(true);
    });
  },
  addWork: function(data){
    // add work item
    return new Promise(function(resolve, reject) {
      /*app.db.work.insert(data, function(err, doc){
        resolve(doc);
      });*/
      resolve({
        _id: "1",
        breaks: [{
          duration: 10855,  // ms
          end: 1516112692153,
          start: 1516112681298
        }],
        duration: 53364,  // ms with breaks
        end: 1516112702713,
        project: "1",
        start: 1516112662904,
        worked_on: "Actualización datos"
      });
    });
  }
};
