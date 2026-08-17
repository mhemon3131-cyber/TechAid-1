// ==========================================================
// AUTHENTICATION CONTROLLER
// ==========================================================

import {
  PrismaClient
} from '@prisma/client';


const prisma =
  new PrismaClient();


// ==========================================================
// BANGLADESH MOBILE VALIDATION
//
// Exactly 11 digits.
//
// Allowed prefixes:
// 013
// 014
// 015
// 016
// 017
// 018
// 019
// ==========================================================

const isValidBangladeshPhone = (
  phone
) => {

  return /^(013|014|015|016|017|018|019)\d{8}$/.test(
    String(
      phone || ''
    ).trim()
  );
};


// ==========================================================
// REGISTER USER
//
// POST /api/auth/register
// ==========================================================

export const registerUser =
  async (
    req,
    res
  ) => {

    try {

      const {
        name,
        email,
        password,
        role,
        specialty,
        phone
      } = req.body;


      // ----------------------------------------------------
      // REQUIRED FIELDS
      // ----------------------------------------------------

      if (
        !name ||
        !email ||
        !password ||
        !phone
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Please provide name, email, password and phone number.'
        });
      }


      const cleanName =
        String(
          name
        ).trim();


      const cleanEmail =
        String(
          email
        )
          .toLowerCase()
          .trim();


      const cleanPassword =
        String(
          password
        ).trim();


      const cleanPhone =
        String(
          phone
        ).trim();


      const userRole =
        role ||
        'CUSTOMER';


      // ----------------------------------------------------
      // PHONE VALIDATION
      // ----------------------------------------------------

      if (
        !isValidBangladeshPhone(
          cleanPhone
        )
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Phone number must be a valid 11-digit Bangladesh mobile number.'
        });
      }


      // ----------------------------------------------------
      // ROLE VALIDATION
      // ----------------------------------------------------

      if (
        userRole !==
          'CUSTOMER' &&
        userRole !==
          'TECHNICIAN' &&
        userRole !==
          'ADMIN'
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Invalid user role.'
        });
      }


      // ----------------------------------------------------
      // DUPLICATE EMAIL
      // ----------------------------------------------------

      const existing =
        await prisma.user.findUnique({

          where: {

            email:
              cleanEmail
          }
        });


      if (
        existing
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'An account with this email address already exists. Please log in.'
        });
      }


      const avatar =
        cleanName
          .slice(
            0,
            2
          )
          .toUpperCase();


      // ----------------------------------------------------
      // CREATE USER
      //
      // Technician hole same transaction-e Technician
      // profile create hobe.
      // ----------------------------------------------------

      const newUser =
        await prisma.user.create({

          data: {

            name:
              cleanName,

            email:
              cleanEmail,

            password:
              cleanPassword,

            role:
              userRole,

            phone:
              cleanPhone,

            avatar,


            technician:
              userRole ===
              'TECHNICIAN'
                ? {

                    create: {

                      name:
                        cleanName,

                      specialty:
                        specialty ||
                        'General Hardware Specialist',

                      rating:
                        4.8,

                      distanceKm:
                        2.5,

                      isAvailable:
                        true,

                      avatar,

                      availableDays:
                        'Mon,Tue,Wed,Thu,Fri',

                      workingHours:
                        '09:00 AM - 06:00 PM',

                      serviceAreas:
                        'Gulshan, Banani, Dhanmondi, Uttara',

                      maxDailyAppointments:
                        5
                    }
                  }
                : undefined
          },


          include: {

            technician:
              true
          }
        });


      // ----------------------------------------------------
      // SUCCESS RESPONSE
      // ----------------------------------------------------

      return res.status(
        201
      ).json({

        success:
          true,

        message:
          `Account created successfully for ${newUser.name}! Saved in database.`,

        user: {

          id:
            newUser.id,

          name:
            newUser.name,

          email:
            newUser.email,

          phone:
            newUser.phone,

          role:
            newUser.role,

          avatar:
            newUser.avatar,

          technicianId:
            newUser.technician
              ? newUser.technician.id
              : null,

          specialty:
            newUser.technician
              ? newUser.technician.specialty
              : null
        }
      });


    } catch (
      error
    ) {

      console.error(
        'Registration error:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Server database error during account creation.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// LOGIN USER
//
// POST /api/auth/login
//
// Checks:
// 1. Email exists
// 2. Password correct
// 3. Selected role matches account
// ==========================================================

export const loginUser =
  async (
    req,
    res
  ) => {

    try {

      const {
        email,
        password,
        role
      } = req.body;


      // ----------------------------------------------------
      // REQUIRED
      // ----------------------------------------------------

      if (
        !email ||
        !password
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Please provide email address and password.'
        });
      }


      const cleanEmail =
        String(
          email
        )
          .toLowerCase()
          .trim();


      const cleanPassword =
        String(
          password
        ).trim();


      // ----------------------------------------------------
      // FIND USER
      // ----------------------------------------------------

      const user =
        await prisma.user.findUnique({

          where: {

            email:
              cleanEmail
          },


          include: {

            technician:
              true
          }
        });


      if (
        !user
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'User account not found. Please create an account.'
        });
      }


      // ----------------------------------------------------
      // ROLE CHECK
      // ----------------------------------------------------

      if (
        role &&
        user.role !==
          role
      ) {

        return res.status(
          401
        ).json({

          success:
            false,

          message:
            `Access denied. This account is registered as ${user.role}.`
        });
      }


      // ----------------------------------------------------
      // PASSWORD CHECK
      // ----------------------------------------------------

      if (
        user.password !==
          cleanPassword
      ) {

        return res.status(
          401
        ).json({

          success:
            false,

          message:
            'Incorrect password.'
        });
      }


      // ----------------------------------------------------
      // LOGIN SUCCESS
      // ----------------------------------------------------

      return res.json({

        success:
          true,

        message:
          `Welcome back, ${user.name}! Logged in as ${user.role}.`,

        user: {

          id:
            user.id,

          name:
            user.name,

          email:
            user.email,

          phone:
            user.phone ||
            '',

          role:
            user.role,

          avatar:
            user.avatar ||
            user.name
              .slice(
                0,
                2
              )
              .toUpperCase(),

          technicianId:
            user.technician
              ? user.technician.id
              : null,

          specialty:
            user.technician
              ? user.technician.specialty
              : null
        }
      });


    } catch (
      error
    ) {

      console.error(
        'Login error:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Server database error during authentication.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET CURRENT USER
//
// GET /api/auth/me/:email
// ==========================================================

export const getCurrentUser =
  async (
    req,
    res
  ) => {

    try {

      const {
        email
      } = req.params;


      const cleanEmail =
        String(
          email
        )
          .toLowerCase()
          .trim();


      if (
        !cleanEmail
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Email address is required.'
        });
      }


      const user =
        await prisma.user.findUnique({

          where: {

            email:
              cleanEmail
          },


          include: {

            technician:
              true
          }
        });


      if (
        !user
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'User not found.'
        });
      }


      return res.json({

        success:
          true,

        user: {

          id:
            user.id,

          name:
            user.name,

          email:
            user.email,

          phone:
            user.phone ||
            '',

          role:
            user.role,

          avatar:
            user.avatar ||
            user.name
              .slice(
                0,
                2
              )
              .toUpperCase(),

          technicianId:
            user.technician
              ? user.technician.id
              : null,

          specialty:
            user.technician
              ? user.technician.specialty
              : null
        }
      });


    } catch (
      error
    ) {

      console.error(
        'Get current user error:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Database error.',

        details:
          error.message
      });
    }
  };