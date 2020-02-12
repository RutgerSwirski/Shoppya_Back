const graphql = require('graphql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10

const User = require('../models/user.model')
const Product = require('../models/product.model')

const { GraphQLSchema, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString, GraphQLFloat } = graphql

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

const ProductType = new GraphQLObjectType({
    name: "Product",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLString },
        user: { 
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userID)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        login: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(parent, args) {
                return User.find( { username: args.username } )
                .then((user) => {
                    if(bcrypt.compareSync(args.password, user.password)) {
                        const token = jwt.sign({id: user._id }, 'my_secret')
                        user.token = token
                        return user
                    } else { null }
                })
                .catch((errors) => { console.log(errors) })
            }
        },
        autoLogin: {
            type: UserType,
            args: {
                token: { type: GraphQLString }
            },
            resolve(parent, args) {
                const decoded = jwt.verify(args.token, 'my_secret')
                if(decoded) {
                    const user_id = decoded.id
                    return User.findById(user_id)
                } else {
                    null
                }
            }
        },
        getProducts: {
            type: new GraphQLList(ProductType),
            resolve(parent, args) {
                return Product.find({})
            }
        },
        getProduct: {
            type: ProductType,
            args: { 
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return Product.findById(args.id)
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        sign_up: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(parent, args) {
                const user = new User({
                    email: args.email,
                    password: bcrypt.hashSync(args.password, saltRounds)
                })
                
                return user.save()
                .then((user) => {
                    const token = jwt.sign({ id: user._id }, 'my_secret' )
                    user.token = token
                    return user
                })
                .catch((errors) => { return errors })
            }
        },
        newProduct: {
            type: ProductType,
            args: {
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                price: { type: GraphQLFloat },
                userID: { type: GraphQLID }
            },
            resolve(parent, args) {
                const product = new Product({
                    name: args.name,
                    description: args.description,
                    price: args.price,
                    userID: args.userID
                })
        
                return product.save()
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})