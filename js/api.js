var Api = {
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

var Sheets = (function() {
  var sheetApi;
  var valueApi;

  return {
    start: function() {
      sheetApi = gapi.client.sheets.spreadsheets;
      valueApi = gapi.client.sheets.spreadsheets.values;
    },
    appendCells: function(sheetId, projects, day) {
      sheetApi.batchUpdate({
        auth: auth,
        spreadsheetId: config.spreadsheetId,
        resource: {requests: {appendCells: {
          sheetId: sheetId,
          rows: this.createValues(projects, day),
          fields: 'userEnteredValue'
        }}}
      });
    },
    createValues: function(projects, day) {
      var values = [];
      values.push({userEnteredValue: {stringValue: day.date}});
      for(var project in projects) {
        var work = day[project.name];
        if(project.simple) {
          values.push({userEnteredValue: {numberValue: work.duration}});
        } else {
          values.push({userEnteredValue: {numberValue: work.start_time}});
          values.push({userEnteredValue: {numberValue: work.end_time}});
          if(project.break) {
            values.push({userEnteredValue: {numberValue: work.start_time2}});
            values.push({userEnteredValue: {numberValue: work.end_time2}});
          }
        }
      }
      return values;
    },
    createSheet: function(title) {
      var result = sheetApi.batchUpdate({
        auth: auth,
        spreadsheetId: config.spreadsheetId,
        resource: {requests: [{addSheet: {properties: {title: title}}}]}
      });
      return {id: result[0].replies.addSheet.properties.sheetId}; 
    },
    getRanges: function(ranges) {  // ["sheet!range", ...]
      return valueApi.batchGet({
        auth: auth,
        spreadsheetId: config.spreadsheetId,
        ranges: range,
        valueRenderOption: 'UNFORMATTED_VALUE',
        majorDimension: 'COLUMNS'
      }).valueRanges; // [{range: "sheet|range", values: [[cellA1, cellA2, ...], [cellB1, cellB2, ...], ...]}, ...]
    },
    listSheets: function() {
      var sheets = {};
      var data = sheetApi.get({ auth: auth, spreadsheetId: config.spreadsheetId});
      for(var s in data.sheets) {
        sheets[s.properties.title] = {id: s.properties.sheetId};
      }
      return sheets;
    }
  }
})();