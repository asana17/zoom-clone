function idSubmit(event) {
  event.preventDefault()
  room_id = call_id.value
  document.location.href = `/${room_id}` + "?uid=" + uid + "&username=" + username
}

const form = document.getElementById('input-form')
const call_id = document.getElementById('call-id')
form.addEventListener('submit', idSubmit)
