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
    axios.get('http://companyx-env-2.eba-c2pbkmaf.us-east-1.elasticbeanstalk.com/API735/getJobByJobName/'+job)
    .then(response => {
      Search.create({jobName: job, date: datetime.slice(0,10), time: datetime.slice(11, 19)}).exec((err) => {
        if (err) {
          res.status(500).send("Database Error");
        }
        //res.status(200).send('Job Found: Entry added');
        res.redirect('/jobs/job/' + job);
      });
    })
    .catch(error => {
      if(error.response.status === 404) {
        // res.status(404).send('Job Not found');
        res.view('pages/order', {
          result: 'failure',
          message: 'Job not found'
        });
      }
    });
    // await Search.create({jobName: job, date: datetime.slice(0,10), time: datetime.slice(11, 19)}).intercept((err)=>{
    //   err.message = 'Uh oh: '+err.message;
    //   return res.status(400).send(err.message);
    // });
  },
};
