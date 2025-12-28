import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ApplyForm() {
  const navigate = useNavigate()
 
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    skill: [],
    phone_number: '',
    email: '',
    years_of_experience: '',
    address: '',
    ssn: '',
    zip_codes: [],
    payment_details: {
      account_number: '',
      routing_number: ''
    },
    proof_of_id: ''
  })
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',')
    setFormData({ ...formData, skill: skills })
  }

  const handleZipCodesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const codes = e.target.value.split(',')
    setFormData({ ...formData, zip_codes: codes })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setPdfFiles(filesArray)
    }
  }

  const handleNextPage = async () => {
    // Validate all required fields
    const requiredFields = [
      'first_name',
      'last_name',
      'date_of_birth',
      'skill',
      'phone_number',
      'email',
      'years_of_experience',
      'address',
      'ssn',
      'zip_codes',
      'payment_details.account_number',
      'payment_details.routing_number'
    ]
  
    const missingFields = requiredFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return !formData[parent][child]
      }
      if (Array.isArray(formData[field])) {
        return formData[field].length === 0
      }
      return !formData[field]
    })
  
    if (missingFields.length > 0) {
      setError('Please fill in all required fields before proceeding')
      return
    }
  
    setError('')
    setLoading(true)
  
    try {
      // Create the freelancer application
      const { data: applicationData, error: applicationError } = await supabase
        .from('freelancer_applications')
        .insert([
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            skill: formData.skill,
            phone_number: formData.phone_number,
            email: formData.email,
            years_of_experience: parseInt(formData.years_of_experience),
            address: formData.address,
            ssn: formData.ssn,
            zip_codes: formData.zip_codes,
            payment_details: formData.payment_details,
            proof_of_id: formData.proof_of_id
          }
        ])
        .select()
  
      if (applicationError) {
        throw new Error(`Failed to create application: ${applicationError.message}`)
      }
  
      if (!applicationData || applicationData.length === 0) {
        throw new Error('Failed to create application: No data returned')
      }
      navigate('/uploadDocuments', { 
        state: { 
          applicationId: applicationData[0].application_id,
          formData: formData
        } 
      })
    } catch (err) {
      console.error('Application submission error:', err)
      setError(`Application submission failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Starting application submission...')
      // Create the freelancer application
      const { data: applicationData, error: applicationError } = await supabase
        .from('freelancer_applications')
        .insert([
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            skill: formData.skill,
            phone_number: formData.phone_number,
            email: formData.email,
            years_of_experience: parseInt(formData.years_of_experience),
            address: formData.address,
            ssn: formData.ssn,
            zip_codes: formData.zip_codes,
            payment_details: formData.payment_details,
            proof_of_id: formData.proof_of_id
          }
        ])
        .select()

      if (applicationError) {
        console.error('Application creation error:', applicationError)
        throw new Error(`Failed to create application: ${applicationError.message}`)
      }

      console.log('Application created successfully:', applicationData)

      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        skill: [],
        phone_number: '',
        email: '',
        years_of_experience: '',
        address: '',
        ssn: '',
        zip_codes: [],
        payment_details: {
          account_number: '',
          routing_number: ''
        },
        proof_of_id: ''
      })
      setPdfFiles([])
      alert('Application submitted successfully!')
    } catch (err) {
      console.error('Application submission error:', err)
      setError(`Application submission failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Freelancer Application
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Join our network of professional service providers
          </p>
        </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-gray-900">
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-gray-900">
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium leading-6 text-gray-900">
                Date of Birth
              </label>
              <div className="mt-2">
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="skill" className="block text-sm font-medium leading-6 text-gray-900">
                Skills (comma-separated)
              </label>
              <div className="mt-2">
                <input
                  id="skill"
                  name="skill"
                  type="text"
                  required
                  value={formData.skill.join(',')}
                  onChange={handleSkillChange}
                  placeholder="cleaning,gardening,painting"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium leading-6 text-gray-900">
                Phone Number
              </label>
              <div className="mt-2">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="years_of_experience" className="block text-sm font-medium leading-6 text-gray-900">
                Years of Experience
              </label>
              <div className="mt-2">
                <input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  required
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                Address
              </label>
              <div className="mt-2">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ssn" className="block text-sm font-medium leading-6 text-gray-900">
                SSN
              </label>
              <div className="mt-2">
                <input
                  id="ssn"
                  name="ssn"
                  type="text"
                  required
                  value={formData.ssn}
                  onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="zip_codes" className="block text-sm font-medium leading-6 text-gray-900">
                Service Area Zip Codes (comma-separated)
              </label>
              <div className="mt-2">
                <input
                  id="zip_codes"
                  name="zip_codes"
                  type="text"
                  required
                  value={formData.zip_codes.join(',')}
                  onChange={handleZipCodesChange}
                  placeholder="12345,67890"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="account_number" className="block text-sm font-medium leading-6 text-gray-900">
                Bank Account Number
              </label>
              <div className="mt-2">
                <input
                  id="account_number"
                  name="account_number"
                  type="text"
                  required
                  value={formData.payment_details.account_number}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment_details: { ...formData.payment_details, account_number: e.target.value }
                  })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="routing_number" className="block text-sm font-medium leading-6 text-gray-900">
                Bank Routing Number
              </label>
              <div className="mt-2">
                <input
                  id="routing_number"
                  name="routing_number"
                  type="text"
                  required
                  value={formData.payment_details.routing_number}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment_details: { ...formData.payment_details, routing_number: e.target.value }
                  })}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/*<div>
              <label htmlFor="pdf_files" className="block text-sm font-medium leading-6 text-gray-900">
                Upload Documents (PDF)
              </label>
              <div className="mt-2">
                <input
                  id="pdf_files"
                  name="pdf_files"
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-blue-600"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Upload one or more PDF documents</p>
            </div>*/}
            {/* Always Visible Next Button */}
            <div className="sticky bottom-4 bg-white py-4 shadow-lg">
              <button
                type="button"
                onClick={handleNextPage}
                disabled={loading}
                className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Next: Upload Documents'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex justify-center items-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}