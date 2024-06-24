export function handler(event: any) {
  console.log('HANDLER INVOKED')
  console.log(event)
  console.log("check locally")

  return {
    message: 'success',
    status: 500
  }
}
