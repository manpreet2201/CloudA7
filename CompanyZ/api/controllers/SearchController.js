/**
 * SearchController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require('axios');

module.exports = {
  search: async function (req, res) {
    var job = req.body.jobName;
    let datetime = new Date().toISOString();
    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobByJobName', {
        params: {
            jobId: job
        }
    })
    .then(response => {
      console.log(response.data);
      if (response.data.Count === 0) {
        return res.view('pages/order', {
          result: 'failure',
          message: 'No such job exists'
        });
      }
      else {
        Search.create({jobName: job, date: datetime.slice(0,10), time: datetime.slice(11, 19)}).exec((err) => {
          if (err) {
            res.status(500).send("Database Error");
          }
          //res.status(200).send('Job Found: Entry added');
          res.redirect('/jobs/job/' + job);
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.view('pages/order', {
        result: 'failure',
        message: 'Error occurred while searching for job'
      });
    });
    // await Search.create({jobName: job, date: datetime.slice(0,10), time: datetime.slice(11, 19)}).intercept((err)=>{
    //   err.message = 'Uh oh: '+err.message;
    //   return res.status(400).send(err.message);
    // });
  },
};
