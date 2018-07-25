function seedDB(){
  var faker = require('faker');
  var student = require('./models/student');
  var user = require('./models/user');
  var position = ['WR', 'RB', 'QB', 'OL', 'K', 'P', 'DL', 'LB', 'DB']

  for (var i = 0; i < 2; i++){
    var first = faker.name.firstName(),
        last = faker.name.lastName();

    var newStudent = {
      name: {
      first: first,
      last: last,
      },
      fullName:first + " " + last,
      school: faker.company.companyName(),
      grade: Math.floor(Math.random() * 5 + 6),
      height: Math.floor(faker.random.number()).toString(),
      weight: Math.floor(faker.random.number()).toString(),
      position: position[Math.floor(Math.random() * position.length)],
      armSpan: Math.floor(faker.random.number()).toString(),
      benchPress: {
        first: Math.floor(faker.random.number()).toString(),
        second: Math.floor(faker.random.number()).toString(),

      },
      broad: Math.floor(faker.random.number()).toString(),
      vertical: Math.floor(faker.random.number()).toString(),
      forty: {
        first: Math.floor(faker.random.number()).toString(),
        second: Math.floor(faker.random.number()).toString()
      },
      shuttle: {
        firstL: Math.floor(faker.random.number()).toString(),
        secondR: Math.floor(faker.random.number()).toString()
      },
      strength: faker.lorem.paragraph(),
      weakness: faker.lorem.paragraph(),
    }

    student.create(newStudent, (err) => {
      if(err){
        console.log(err)
      }else{
        console.log('create Stduent')
      }
    })
  }


  user.register(user({username:"Admin", email:"admin@gmail.com", isAdmin: true, isCoach: false}), "admin", function(err){
      if(!err){
          passport.authenticate('local');
          console.log('add a user');
      }
  });

}


module.exports = seedDB;