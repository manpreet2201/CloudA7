const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// set the view engine to ejs
app.set('view engine', 'ejs');

// homepage 
app.get('/', function(req, res) {
    res.render('pages/homepage');
});

app.get('/API735/getJobs', function(req, res) {
    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobs')
        .then(function (response) {
            //console.log(response);
            let allJobs = response.data.Items;
            let jobsArr = [];
            allJobs = allJobs.filter(job => {
                if (jobsArr.includes(job.jobId)) {
                    return false;
                } else {
                    jobsArr.push(job.jobId);
                    return true;
                }
            });
            console.log(allJobs);
            res.send(allJobs);
        })
        .catch(function (error) {
            console.log(error);
            res.status(400).send('Error in fetching jobs');
        });
});

app.get('/API735/getJobInfo/:jobid/:partid', function(req, res) {
    let jobId = req.params.jobid;
    let partId = parseInt(req.params.partid);
    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
        params: {
            jobId: jobId,
            partId: partId
        }
    })
    .then(function (response) {
        console.log(response);
        let job = response.data;
        //Check for empty object
        if (Object.keys(job).length === 0 && job.constructor === Object) {
            res.status(404).send(`Job with given jobId:${jobId} and partId:${partId} not found...`);
        } else {
            res.send(job.Item);
        }
    })
    .catch(function (error) {
        console.log(error);
        res.status(400).send('Error in fetching job and part');
    });
});

app.get('/API735/getJobByJobName/:jobid', function(req, res) {
    let jobId = req.params.jobid
    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobByJobName', {
        params: {
            jobId: jobId
        }
    })
    .then(function (response) {
        console.log(response);
        if (response.data.Count > 0) {
            res.send(response.data.Items);
        }
        else {
            res.status(404).send(`Job with given jobId:${jobId} not found...`)
        }
    })
    .catch(function (error) {
        console.log(error);
        res.status(400).send('Error in fetching job details');
    });
});

app.post('/API735/createJob', function(req, res) {
    if(req.body && req.body.jobId && req.body.partId && req.body.qty) {
        const jobId = req.body.jobId;
        const partId = parseInt(req.body.partId);
        const qty = parseInt(req.body.qty);

        axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
            params: {
                jobId: jobId,
                partId: partId
            }
        })
        .then(function(response) {
            console.log(response);
            let job = response.data;
            //Check for empty object
            if (Object.keys(job).length !== 0) {
                return res.status(400).send(`Job with given jobId:${jobId} and partId:${partId} already exists`);
            } else {

                axios.get('https://zy9pj7prqf.execute-api.us-east-1.amazonaws.com/Dev/getspecificpartdetails', {
                    params: {
                        partId: partId
                    }
                })
                .then(function(response) {
                    let partDetail = response.data;

                    if (Object.keys(partDetail).length === 0 && partDetail.constructor === Object) {
                        return res.status(404).send(`Given partID:${partId} is not valid`);
                    } else {
                        axios.post('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/createJob', {
                            jobId: jobId,
                            partId: partId,
                            qty: qty
                        })
                        .then(function(response) {
                            console.log(response);
                            if (response.data.hasOwnProperty('body')) {
                                return res.send(`New job with jobId:${jobId} and partId:${partId} created successfully`);
                            } else {
                                return res.status(400).send(`Error in creating job`);
                            }
                        })
                        .catch(function(error) {
                            console.log(error);
                            return res.status(400).send(`Error in creating job`);
                        });
                    }
                })
                .catch(function(error) {
                    console.log(error);
                    return res.status(400).send('Error in fetching part details');
                });
            }
        })
        .catch(function(error) {
            console.log(error);
            res.status(400).send('Error in fetching job details');
        });
    }
    else {
        res.status(404).send(`Parameters missing in request body!`);
    }
});

app.post('/API735/deleteJob', function(req, res) {
    if (req.body && req.body.jobId && req.body.partId) {
        const jobId = req.body.jobId;
        const partId = parseInt(req.body.partId);

        axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
            params: {
                jobId: jobId,
                partId: partId
            }
        })
        .then(function(response) {
            let job = response.data;
            if (Object.keys(job).length === 0 && job.constructor === Object) {
                return res.status(404).send(`Job with given jobId:${jobId} and partId:${partId} does not exist!`);
            } else {
                axios.post('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/deleteJob', {
                    jobId: jobId,
                    partId: partId    
                })
                .then(function(response) {
                    if (response.data.hasOwnProperty('body')) {
                        return res.send(`Quantity with jobId:${jobId} and partId:${partId} deleted successfully!`);
                    } else {
                        return res.status(400).send(`Error in deleting job`);
                    }
                })
                .catch(function(error) {
                    console.log(error);
                    return res.status(400).send('Error in deleting job')
                });
            }
        })
        .catch(function (error) {
            console.log(error);
            return res.status(400).send('Error in fetching job and part');
        });
    } else {
        res.status(400).send(`Parameters missing in request body!`);
    }
});

app.post('/deleteData/:jobid/:partid', function(req, res) {
    const jobId = req.params.jobid;
    const partId = parseInt(req.params.partid);

    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
        params: {
            jobId: jobId,
            partId: partId
        }
    })
    .then(function(response) {
        let job = response.data;
        if (Object.keys(job).length === 0 && job.constructor === Object) {
            return res.send(`Job not found for deletion`);
        } else {
            axios.post('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/deleteJob', {
                jobId: jobId,
                partId: partId    
            })
            .then(function(response) {
                if (response.data.hasOwnProperty('body')) {
                    return res.redirect('/viewData');
                } else {
                    return res.status(400).send(`Error in deleting job`);
                }
            })
            .catch(function(error) {
                console.log(error);
                return res.status(400).send('Error in deleting job')
            });
        }
    })
    .catch(function (error) {
        console.log(error);
        return res.status(400).send('Error in fetching job and part');
    });
});

app.put('/API735/updateJob', function(req, res) {
    if (req.body && req.body.jobId && req.body.partId && req.body.qty) {
        const jobId = req.body.jobId;
        const partId = parseInt(req.body.partId);
        const qty = parseInt(req.body.qty);

        axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
            params: {
                jobId: jobId,
                partId: partId
            }
        })
        .then(function (response) {
            console.log(response);
            let job = response.data;
            //Check for empty object
            if (Object.keys(job).length === 0 && job.constructor === Object) {
                return res.status(404).send(`Job with given jobId:${jobId} and partId:${partId} does not exist`);
            } else {
                axios.put('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/updateJob', {
                    jobId: jobId,
                    partId: partId,
                    qty: qty
                })
                .then(function(response) {
                    if (response.data.hasOwnProperty('body')) {
                        return res.send(`Quantity for jobId:${jobId} and partId:${partId} updated successfully!`);
                    } else {
                        return res.status(404).send(`Error in updating job`);
                    }
                })
                .catch(function(error) {
                    console.log(error);
                    return res.status(400).send('Error in updating job');
                });
            }
        })
        .catch(function (error) {
            console.log(error);
            res.status(400).send('Error in fetching job and part');
        });
    } else {
        res.status(400).send(`Parameters missing in request body!`);
    }
});

app.post('/editJob/:jobid/:partid', function(req, res) {
    const jobId = req.params.jobid;
    const partId = parseInt(req.params.partid);

    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
        params: {
            jobId: jobId,
            partId: partId
        }
    })
    .then(function(response) {
        console.log(response);
        let job = response.data;
        //Check for empty object
        if (Object.keys(job).length === 0 && job.constructor === Object) {
            return res.status(404).send(`Job not found...`);
        } else {
            res.render('pages/edit', {id: jobId, partId: partId});
        }
    })
    .catch(function (error) {
        console.log(error);
        res.status(400).send('Error in fetching job and part');
    });
});

app.post('/updateData/:jobid/:partid', function(req, res) {
    const jobId = req.params.jobid;
    const partId = parseInt(req.params.partid);
    const qty=parseInt(req.body.qty);

    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
        params: {
            jobId: jobId,
            partId: partId
        }
    })
    .then(function (response) {
        console.log(response);
        let job = response.data;
        //Check for empty object
        if (Object.keys(job).length === 0 && job.constructor === Object) {
            return res.status(404).send(`Job with given jobId:${jobId} and partId:${partId} does not exist`);
        } else {
            axios.put('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/updateJob', {
                jobId: jobId,
                partId: partId,
                qty: qty
            })
            .then(function(response) {
                if (response.data.hasOwnProperty('body')) {
                    return res.redirect('/viewData');
                } else {
                    return res.status (404).send(`Error in updating job`);
                }
            })
            .catch(function(error) {
                console.log(error);
                return res.status(400).send('Error in updating job');
            });
        }
    })
    .catch(function (error) {
        console.log(error);
        res.status(400).send('Error in fetching job and part');
    });
});

//not tested for empty jobs table
app.get('/viewData', function(req, res) {
    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobs')
        .then(function (response) {
            //console.log(response);
            let allJobs = response.data;
            //Check for empty object
            if (Object.keys(allJobs).length === 0 && allJobs.constructor === Object) {
                res.send('Cannot find anything to show!');
            } else {
                res.render('pages/viewData', {jobs735: allJobs.Items});
            }
            console.log(allJobs);
        })
        .catch(function (error) {
            console.log(error);
            res.status(400).send('Error in fetching jobs');
        });
});

app.get('/addData', function(req, res) {
    res.render('pages/addData');
});

app.post('/addData', function(req, res) {
    const jobId = req.body.jobId;
    const partId = parseInt(req.body.partId);
    const qty = parseInt(req.body.qty);

    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/getJobInfo', {
        params: {
            jobId: jobId,
            partId: partId
        }
    })
    .then(function(response) {
        console.log(response);
        let job = response.data;
        //Check for empty object
        if (Object.keys(job).length !== 0) {
            return res.status(400).send(`Job with given jobId:${jobId} and partId:${partId} already exists`);
        } else {

            axios.get('https://zy9pj7prqf.execute-api.us-east-1.amazonaws.com/Dev/getspecificpartdetails', {
                params: {
                    partId: partId
                }
            })
            .then(function(response) {
                let partDetail = response.data;

                if (Object.keys(partDetail).length === 0 && partDetail.constructor === Object) {
                    return res.status(404).send(`Given partID:${partId} is not valid`);
                } else {
                    axios.post('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/createJob', {
                        jobId: jobId,
                        partId: partId,
                        qty: qty
                    })
                    .then(function(response) {
                        console.log(response);
                        if (response.data.hasOwnProperty('body')) {
                            // return res.send(`New job with jobId:${jobId} and partId:${partId} created successfully`);
                            return res.redirect('/viewData');
                        } else {
                            return res.status(400).send(`Error in creating job`);
                        }
                    })
                    .catch(function(error) {
                        console.log(error);
                        return res.status(400).send(`Error in creating job`);
                    });
                }
            })
            .catch(function(error) {
                console.log(error);
                return res.status(400).send('Error in fetching part details');
            });
        }
    })
    .catch(function(error) {
        console.log(error);
        res.status(400).send('Error in fetching job details');
    });
});

app.get('/searchJob', function(req, res) {
    res.render('pages/searchJob');
});

app.post('/searchOrders', function(req, res) {
    const jobId = req.body.jobId;

    axios.get('https://eg1mx8iu96.execute-api.us-east-1.amazonaws.com/Dev/searchJob', {
        params: {
            jobId: jobId
        }
    })
    .then(function(response) {
        let orders = response.data;
        //Check for empty object
        if (orders.Count === 0) {
            return res.send(`No orders for given jobName:${jobId} found`);
        } else {
            let ordersInfo = orders.Items;
            return res.render('pages/ordersInfo', {ordersInfo});
        }
    })
    .catch(function(error) {
        console.log(error);
        res.status(400).send('Error in searching for job');
    });
});

app.listen(3000, function () {
    console.log('Listening on port 3000');
});