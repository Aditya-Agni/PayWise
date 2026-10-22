// const asyncHandler = (requestHandler)=>{
//     return async(req,res,next)=>{
//         try{
//             await requestHandler(req,res,next)
//         }
//         catch(error){
//             next(error)
//         }
//     }
// }

export const asyncHandler = (requestHandler) => (req,res,next)=> Promise
    .resolve(requestHandler(req,res,next))
    .catch(e=>next(e))
