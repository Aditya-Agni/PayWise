export const errorMiddleware = (err,req,res,next)=>{
    console.log(err.stack);
    
    res.status(err.statusCode || 500)
    .json({
        success:err.success,
        status:err.statusCode || 500,
        message:err.message,
        errors:err.errors
    })
}