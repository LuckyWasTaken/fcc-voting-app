const Poll = require('../models/Poll');
var shortid = require('shortid');

exports.getCreatePoll = (req,res) => {
    res.render('vote/create', {
    title: 'Create a poll'
  });
};



exports.postCreatePoll = (req,res) => {
    var user;
    
    if(req.body.checkbox == 'on') user = req.user.profile.name||req.user.email;
    else user = 'Anonymous';
    
    var id = shortid.generate();
    console.log();
    
    const poll = new Poll({
      author: user,
      title: req.body.title,
      votes: req.body.options.split(',').map(function(item){
        return {option: item, votes: 0};
      }),
      timeCreated: Date.now(),
      id:id
    });
    poll.save((err) => {
        if(err) throw err;
        res.redirect("/poll/vote/"+id);
    });
    
};

exports.getPoll = (req,res) => {
   Poll.findOne({id:req.params.id}, (err, poll) => {
       if (err) throw err;
       if (!poll) res.end('Error 404')
       console.log(poll);
       res.render('vote/vote', {
        title: 'Vote - ' + poll.title,
        poll: poll
       });
   });
};

exports.vote = (req, res) => {
    Poll.findOne({id:req.params.id}, (err,poll) => {
        if (err) throw err;
        if (!poll) res.end('Error 404');
        var exists = poll.votes.filter(function(item){
            return item.option === req.params.option;
        });
        if (exists.length == 0) {
            Poll.update(
                {id: req.params.id, "votes.option": {$ne: req.params.option}},
                {$addToSet : {"votes" : {'option' : req.params.option , 'votes' : 1 }}},
                {},
                () => {res.redirect("/results/"+req.params.id)}
            );
        }
        else {
            Poll.update(
                {id: req.params.id, "votes.option" : req.params.option},
                {$inc: { "votes.$.votes" : 1 }},
                {},
                () => {res.redirect("/results/"+req.params.id)}
            );
        }
    });
};

exports.results = (req, res) => {
  Poll.findOne({id:req.params.id}, (err, poll) => {
       if (err) throw err;
       if (!poll) res.end('Error 404');
       var results = [];
       poll.votes.forEach(function(i){
           results.push(["['"+i.option+"',"+i.votes+"]"]);
       });
       console.log(results);
       res.render('vote/results', {
        title: 'Results - ' + poll.title,
        poll: poll,
        results: results
       });
   }); 
};


exports.myPolls = (req,res) => {
    var author = req.user.profile.name||req.user.email;
    Poll.find({author: author}, (err,polls) => {
        if (err) throw err;
        console.log(polls);
        res.render('vote/my', {
            title: 'My polls',
            polls: polls
       });
    });
};

exports.delete = (req,res) => {
  Poll.findOne({id: req.params.id},(err, poll) => {
      if(err) throw err;
      if(poll.author == req.user.profile.name||req.user.email) {
         Poll.findOneAndRemove({id:req.params.id}, (err) => {res.redirect('/poll/my')})
      }
      
  });  
};

exports.recent = (req, res) => {
    Poll.find({}).sort('-timeCreated').limit(10).exec((err,polls) => {
        if (err) throw err;
        res.render('vote/recent', {
            title: 'Recent Polls',
            polls: polls
       });
    });
};