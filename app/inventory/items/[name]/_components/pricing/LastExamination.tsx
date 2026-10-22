import Card from "@/components/Card"
import UserIcon from "@/components/UI/UserIcon"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"
import { useItemSelection } from "@/store/itemSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { DateTime } from "luxon"

const LastExamination = () => {
  const { examinations } = useItemSelection()

  if (examinations.length === 0) {
    return (
      <p>No examinations</p>
    )
  }


  return (
    <Card.Root>
      <Card.Title>Last Examination</Card.Title>


      <div className="overflow-x-auto">
        <h1 className="font-semibold text-xl text-base-content/50">{'Details'}</h1>
        <table className="table table-zebra ">
          <tbody>
            <tr>
              <td className="font-semibold">Examnined On</td>
              <td>{DateTime.fromJSDate(examinations[0].createdAt).toFormat(dateFormatWithTime)}</td>
            </tr>
            <tr>
              <td className="font-semibold">Examined By</td>
              <td className="flex items-center gap-2"><UserIcon kind={examinations[0].user.kind} image={examinations[0].user.image || ''} name={examinations[0].user.name || ''} />{examinations[0].user.name}</td>
            </tr>
          </tbody>
        </table>
      </div>




      <div className="overflow-x-auto">
        <h1 className="font-semibold text-xl text-base-content/50">{'Finished Products'}</h1>
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Retail</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {examinations[0].FinishedProductArchive.map((fp) => {
              return (
                <tr key={fp.id}>
                  <td>{fp.name}</td>
                  <td>{toFracitonalDigits.curreny(fp.consumerPrice)}</td>
                  <td>{toFracitonalDigits.curreny(fp.finishedProductTotalCost)}</td>
                </tr>
              )
            })}

          </tbody>
        </table>
      </div>


    </Card.Root>
  )
}

export default LastExamination
