import axios from 'axios'
import Student from '../models/Student.js';




//Fetches a list of rated Codeforces users who have an email address, 
// limited to the specified number
async function fetchRatedUsersWithEmail(limit = 50) {
  const url = 'https://codeforces.com/api/user.ratedList';
  const { data } = await axios.get(url);
  if (data.status !== 'OK') throw new Error(data.comment);

  // Filter users with email and limit esults
  const usersWithEmail = data.result.filter(user => user.email).slice(0, limit);
  return usersWithEmail;
}


// Fetch first and last name for a given Codeforces handle
async function fetchUserName(handle) {
  const url = `https://codeforces.com/api/user.info?handles=${handle}`;
  const { data } = await axios.get(url);
  if (data.status !== 'OK') throw new Error(data.comment);

  const user = data.result[0];
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
  };
}


//seeding process by fetching users with emails, getting their names, 
//and creating student records in the database
async function seedStudentsFromRatedList() {
  console.log('Fetching rated users with email from Codeforces...');
  const users = await fetchRatedUsersWithEmail(100);

  for (const user of users) {
    try {
      const { firstName, lastName } = await fetchUserName(user.handle);

      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || user.handle;

      const studentData = {
        name: fullName,
        email: user.email,
        phone: '',
        codeforces_handle: user.handle,
        cf_handle: user.handle,
        current_rating: user.rating ?? null,
        max_rating: user.maxRating ?? null,
      };

      // Directly create new student document
      await Student.create(studentData);

      console.log(`Created student: ${studentData.name} (${studentData.codeforces_handle})`);
    } catch (err) {
      // Handle duplicate key error gracefully if any
      if (err.code === 11000) {
        console.warn(`Student with email ${user.email} already exists, skipping.`);
      } else {
        console.error(`Failed to create user ${user.handle}:`, err.message);
      }
    }
  }

  console.log('Student seeding completed.');
}


export default seedStudentsFromRatedList